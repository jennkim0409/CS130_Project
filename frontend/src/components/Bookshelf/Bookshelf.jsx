import React, {useState} from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
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
import reading from './reading.json';
import recommended from './recommended.json';

const Bookshelf = () => {
  // items imported from .json (links to images)
  // hash table into readingList and recommendedList
  const [items, setItems] = useState({
    readingList: reading,
    recommendedList: recommended,
  })

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
        <SortableContext items={items.readingList} strategy={rectSortingStrategy}>
        {/* can adjust the # of columns, but update .css accordingly */}
          <Grid title='Interested' columns={8}>
            {items.readingList.map((url, index) => (
              <SortablePhoto key={url} url={url} index={index} />
            ))}
          </Grid>
        </SortableContext>
      </div>
      
      <div>
        <SortableContext items={items.recommendedList} strategy={rectSortingStrategy}>
          <Grid title='Finished' columns={8}>
            {items.recommendedList.map((url, index) => (
              <SortablePhoto key={url} url={url} index={index} />
            ))}
          </Grid>
        </SortableContext>
      </div>

      {/* handles overlay and smooth animation */}
      <DragOverlay adjustScale={true}>
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
    setActiveId(event.active.id);
    console.log("drag start: " + event.active.id);
    console.log("drag start: " + findContainer(event.active.id));
  }

  /* when user drags draggable over a droppable
  should be able to hop between position and containers
  not super necessary to understand logic!  */
  function handleDragOver(event) {

    // active is the dragging component
    // over is the position it is dragging over
    const { active, over, draggingRect } = event;
    const { id } = active;
    const { id: overId } = over;
    // find the bookshelf container that they are in
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    console.log('drag over, active container: ' + activeContainer);
    console.log('drag over, over container: ' + overContainer);

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
      const activeIndex = activeItems.indexOf(id);
      const overIndex = overItems.indexOf(overId);

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
          ...prev[activeContainer].filter((item) => item !== active.id)
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

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);
    
    console.log('drag end, active container: ' + activeContainer);
    console.log('drag end, over container: ' + overContainer);
    console.log('active index: ' + activeIndex);
    console.log('over index: ' + overIndex);

    // if the draggable is dragged into a new position
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
  function findContainer(id) {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  }
  
};

export default Bookshelf;
