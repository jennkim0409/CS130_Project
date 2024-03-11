import React, {useState, useEffect, useMemo } from 'react';
import expiredToken from '../ExpiredToken';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';


// components
import {Grid} from './Grid';
import {SortablePhoto} from './SortablePhoto';
import {Photo} from './Photo';
import remove from '../../assets/remove.png';


const Bookshelf = () => {

  // items imported from .json (links to images)
  // hash table into readingList and finishedList
  const [items, setItems] = useState({
    readingList: [],
    finishedList: [],
  });

  // starting shelf for a book that is moved
  const [startingShelf, setStartingShelf] = useState('');
  const [startIndex, setStartIndex] = useState('');

  // Map items to an array of strings containing the ids
  const readingListIds = useMemo(() => items.readingList.map((item) => item.cover), [items.readingList]);
  const finishedListIds = useMemo(() => items.finishedList.map((item) => item.cover), [items.finishedList]);
  
  // runs when component mounts
  useEffect(() => {
    const fetchBookshelfData = async () => {
      try {
        const shelves = ["current", "finished"];
        // get books for each shelf
        const promises = shelves.map(async (shelfName) => {
          const response = await axios.get('http://localhost:5555/api/handlebooks/getBooks/', {
            params: { userId: localStorage.getItem("user_id").replace(/"/g, ''), type: shelfName },
            headers: { Authorization: localStorage.getItem("user_token") }
          });
          return { [shelfName]: response.data };
        });

        // wait for data for all shelves to be fetched
        const results = await Promise.all(promises);

        // format data to match other code in this file
        const itemsData = {};
        results.forEach((result) => {
          const shelfName = Object.keys(result)[0];
          const itemsDataShelfName = shelfName === "current" ? "readingList" : "finishedList";
          itemsData[itemsDataShelfName] = result[shelfName];
        });

        // populate each bookshelf with book objects
        setItems(itemsData);
        console.log(itemsData)
      } catch (error) {
        console.error("Error fetching books:", error);
        if (error.response.data.message === "Unauthorized- Invalid Token" || 
          error.response.data.message === "Unauthorized- Missing token") {
          expiredToken();
        } 
      }
    };

    fetchBookshelfData();
  }, []);

  const removeBook = async (opt) => {
    let bookshelfType = "";
    if (items.readingList.some(book => book._id === opt._id)) {
      bookshelfType = 'current';
    }
    else {
      bookshelfType = 'finished';
    }

    axios.post('http://localhost:5555/api/handlebooks/removeBook', 
    { userId: localStorage.getItem("user_id").replace(/"/g, ''), bookshelfType: bookshelfType, bookId: opt._id }, 
    {
        headers: {
            Authorization: localStorage.getItem("user_token")
        }
      })
      .then(response => {
          console.log("Book successfully removed: ", response.data);
          // @ charlene TO DO: remove book from list in frontend/re-render the shelf
          // (currently refreshing the page shows the book is removed)
      })
      .catch(error => {
          console.error("Error removing book: ", error.response);
          if (error.response.data.message === "Unauthorized- Invalid Token" || 
            error.response.data.message === "Unauthorized- Missing token") {
            expiredToken();
          }
      });
  };

  // activeId denotes what component is currently interacted with
  // setActiveId handles updating this ID
  // need to useState so that you can manage state 
  // (or, preserve values between function calls)
  const [activeId, setActiveId] = useState(null);

  // books activated by mouse and touch sensors
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    // all DND components must be within DndContext component
    <DndContext
      // attach sensors
      sensors={sensors}
      // collision detection algorithm (closestCenter most suitable for sorted)
      collisionDetection={closestCenter}
      // attach handler functions
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
    {/* this div holds all page content */}
      

    <div>
      <SortableContext items={readingListIds} strategy={rectSortingStrategy}>
      {/* can adjust the # of columns, but update .css accordingly */}
        <Grid title='Interested' columns={8}>
          {items.readingList.map((book, index) => (
            <div className="book-image-container" style={{height: `calc(10vw * 3/2 * 0.8)`, width: `calc(10vw * 0.8)`, borderRadius:"0px"}}>
              <SortablePhoto key={book.cover} url={book.cover} index={index} />
              <div 
                className="remove-button" 
                onClick={() => {
                    if (window.confirm("Are you sure you want to delete this book from your shelf?")) {
                        removeBook(book)
                    }
                }}>
                <img src={remove} alt="Remove" />
              </div>
            </div>
          ))}
        </Grid>
      </SortableContext>
    </div>
    
    <div>
      <SortableContext items={finishedListIds} strategy={rectSortingStrategy}>
        <Grid title='Finished' columns={8}>
          {items.finishedList.map((book, index) => (
            <div className="book-image-container" style={{height: `calc(10vw * 3/2 * 0.8)`, width: `calc(10vw * 0.8)`, borderRadius:"0px"}}>
              <SortablePhoto key={book.cover} url={book.cover} index={index} />
              <div 
                className="remove-button" 
                onClick={() => {
                    if (window.confirm("Are you sure you want to delete this book from your shelf?")) {
                        removeBook(book)
                    }
                }}>
                <img src={remove} alt="Remove" />
              </div>
            </div>
          ))}
        </Grid>
      </SortableContext>
    </div>
      
      {/* handles overlay and smooth animation */}
      <DragOverlay>
        {/* only trigger when there is an active component, else display nothing */}
        {activeId ? (
          <div>
            {/* create overlay based on same active component */}
            <Photo url={activeId} />
          </div>
        ) : null}
      </DragOverlay>
      
    </DndContext>
  );

  /* when user starts dragging draggable component
  set this component to the active ID */
  function handleDragStart(event) {
    console.log(`Picked up draggable item ${event.active.id}.`);
    setActiveId(event.active.id);
    setStartingShelf(findContainer(event.active.id));
    setStartIndex(items[findContainer(event.active.id)].findIndex(book => book.cover === event.active.id));
  }

  /* when user drags draggable over a droppable
  should be able to hop between position and containers
  not super necessary to understand logic!  */
  function handleDragOver(event) {
    if (event.over.id) {
      //console.log(`Draggable item ${event.active.id} was moved over droppable area ${event.over.id}.`) ;
    }
    else {
      //console.log(`Draggable item ${event.active.id} is no longer over a droppable area.`);
    }

    // active is the dragging component
    // over is the position it is dragging over
    const { active, over, draggingRect } = event;
    const { id } = active;
    const { id: overId } = over;
    // find the bookshelf container that they are in
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    // if there is no active, over, or if they do not collide
    // (i.e. no interaction being made, simply return)
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // find the indexes for the items
      const activeIndex = activeItems.findIndex(book => book.cover === id);
      const overIndex = overItems.findIndex(book => book.cover === overId);

      let newIndex;
      if (overId in prev) {
        // we're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          draggingRect > over.rect + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((book) => book.cover !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  }

  // when a user lets go of draggable
  function handleDragEnd(event) {
    // active is draggable component
    // over is the component it is dragging over
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    // find the bookshelf containers that they are in
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    // if there is no active, over, or if they are do not collide
    // (i.e. no interaction being made, simply return)
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].findIndex(book => book.cover === active.id);
    let overIndex = items[overContainer].findIndex(book => book.cover === overId);

    console.log("active, over index:", activeIndex, overIndex);
    // update backend of book movement
    const endingShelf = activeContainer;
    
    // TODO: use this starting index!!
    console.log("starting index, shelf:", startIndex, startingShelf);
    console.log("ending index, shelf:", overIndex, endingShelf);
    
    if (overIndex === -1) {
      overIndex = 0;
    }

    // if the shelves are different, insert at active index
      // NOTE: this code inserts the book at the place it is *supposed* to be inserted
      // -> in other words, it disregards the current visual bug where the book is inserted one index AFTER it is supposed to be
      // -> ultimately, once that visual bug is fixed, this code will line up with visuals
    if (startingShelf != endingShelf) {
      const bookToMove = items[endingShelf].find(book => book.cover === id);

      let bookData = {};
      bookData.userId = localStorage.getItem("user_id").replace(/"/g, '');
      bookData.bookId = bookToMove._id;
      bookData.fromShelf = startingShelf === "readingList" ? "current" : "finished";
      bookData.toShelf = endingShelf === "readingList" ? "current" : "finished";
      bookData.newOrder = overIndex;

      axios.post('http://localhost:5555/api/handlebooks/moveBook', { ...bookData }, {
        headers: {
            Authorization: localStorage.getItem("user_token")
        }
      })
      .then(response => {
          console.log("Book successfully moved across shelves: ", response.data);
      })
      .catch(error => {
          console.error("Error moving book across shelves: ", error.response);
          if (error.response.data.message === "Unauthorized- Invalid Token" || 
            error.response.data.message === "Unauthorized- Missing token") {
            expiredToken();
          }
          
      });
    }
    // if shelves are the same, insert at the over index
    else {
      const bookToMove = items[startingShelf].find(book => book.cover === id);

      let bookData = {};
      bookData.userId = localStorage.getItem("user_id").replace(/"/g, '');
      bookData.bookId = bookToMove._id;
      bookData.fromShelf = startingShelf === "readingList" ? "current" : "finished";
      bookData.toShelf = bookData.fromShelf;
      bookData.newOrder = overIndex;

      axios.post('http://localhost:5555/api/handlebooks/moveBook', { ...bookData }, {
        headers: {
            Authorization: localStorage.getItem("user_token")
        }
      })
      .then(response => {
          console.log("Book successfully moved within the shelf: ", response.data);
      })
      .catch(error => {
          console.error("Error moving book within the shelf: ", error.response);
          if (error.response.data.message === "Unauthorized- Invalid Token" || 
            error.response.data.message === "Unauthorized- Missing token") {
            expiredToken();
          }
      });
    }
    
    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
      }));
    }

    // after exchange is made, set active ID to null
    setActiveId(null);
  }

  // if user cancels drag, set active ID to null
  function handleDragCancel() {
    setActiveId(null);
  }

  // helper function to locate bookshelf container by component ID
  // id = url corresponding to cover images
  function findContainer(id) {
    if (id in items) {
      return id;
    }

    if (id == "Interested") { return "readingList" };
    if (id == "Finished") { return "finishedList" };

    // return name of bookshelf that contains the book corresponding to this id (cover url)
    return Object.keys(items).find((shelfName) => {
      const shelf = items[shelfName];
      return shelf.some(book => book.cover === id);
    });
  }
};

export default Bookshelf;
