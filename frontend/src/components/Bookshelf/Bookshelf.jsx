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

/**
 * Namespace containing functions related to the Bookshelf component.
 * @namespace Bookshelf
 */
const Bookshelf = () => {

  /**
   * State hook to manage items in the reading and finished lists.
   * @memberof Bookshelf
   */
  const [items, setItems] = useState({
    readingList: [],
    finishedList: [],
  });

  /**
   * State hook to manage the starting shelf for a book that is moved.
   * @memberof Bookshelf
   */
  const [startingShelf, setStartingShelf] = useState('');
  
  /**
   * State hook to manage the starting index for a book that is moved.
   * @memberof Bookshelf
   */
  const [startIndex, setStartIndex] = useState('');

  /**
   * Memoized array of reading list item ids.
   * @memberof Bookshelf
   */
  const readingListIds = useMemo(() => items.readingList.map((item) => item.cover), [items.readingList]);
  
  /**
   * Memoized array of finished list item ids.
   * @memberof Bookshelf
   */
  const finishedListIds = useMemo(() => items.finishedList.map((item) => item.cover), [items.finishedList]);
  

  useEffect(() => {
    /**
     * Fetches bookshelf data when the component mounts.
     * @memberof Bookshelf
     * @function fetchBookshelfData
     */
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

  /**
   * Removes a book from the reading or finished list.
   * @memberof Bookshelf
   * @function removeBook
   * @param {Object} opt - The book to be removed.
   */
  const removeBook = async (opt) => {
    let updatedItems = { ...items };
    let bookshelfType = "";
    let bookshelfName = 'finishedList';
    
    if (items.readingList.some(book => book._id === opt._id)) {
      bookshelfType = 'current';
      bookshelfName = 'readingList';
    }
    else {
      bookshelfType = 'finished';
      bookshelfName = 'finishedList';
    }

    // Remove the book from the appropriate bookshelf
    updatedItems[bookshelfName] = items[bookshelfName].filter(book => book._id !== opt._id);

    // Update the state with the new items
    setItems(updatedItems);

    axios.post('http://localhost:5555/api/handlebooks/removeBook', 
    { userId: localStorage.getItem("user_id").replace(/"/g, ''), bookshelfType: bookshelfType, bookId: opt._id }, 
    {
        headers: {
            Authorization: localStorage.getItem("user_token")
        }
      })
      .then(response => {
          console.log("Book successfully removed: ", response.data);
      })
      .catch(error => {
          console.error("Error removing book: ", error.response);
          if (error.response.data.message === "Unauthorized- Invalid Token" || 
            error.response.data.message === "Unauthorized- Missing token") {
            expiredToken();
          }
      });
  };

  /**
   * State hook to manage the ID of the active component.
   * @memberof Bookshelf
   */
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
            <div className="book-image-container" style={{overflow: "visible", height: `calc(10vw * 3/2 * 0.8)`, width: `calc(10vw * 0.8)`, borderRadius:"0px"}}>
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
            <div className="book-image-container" style={{overflow: "visible", height: `calc(10vw * 3/2 * 0.8)`, width: `calc(10vw * 0.8)`, borderRadius:"0px"}}>
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

  /**
   * Handles the start of a drag operation.
   * @memberof Bookshelf
   * @function handleDragStart
   * @param {Object} event - The drag event object.
   */
  function handleDragStart(event) {
    console.log(`Picked up draggable item ${event.active.id}.`);
    setActiveId(event.active.id);
    setStartingShelf(findContainer(event.active.id));
    setStartIndex(items[findContainer(event.active.id)].findIndex(book => book.cover === event.active.id));
  }

  /**
   * Handles the dragging over of a droppable area.
   * @memberof Bookshelf
   * @function handleDragOver
   * @param {Object} event - The drag event object.
   */
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

  /**
   * Handles the end of a drag operation.
   * @memberof Bookshelf
   * @function handleDragEnd
   * @param {Object} event - The drag event object.
   */
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

  /**
   * Handles the cancellation of a drag operation.
   * @memberof Bookshelf
   * @function handleDragCancel
   */
  function handleDragCancel() {
    setActiveId(null);
  }

  /**
   * Helper function to locate bookshelf container by component ID.
   * @memberof Bookshelf
   * @function findContainer
   * @param {string} id - The component ID.
   * @returns {string} - The name of the bookshelf container.
   */
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
