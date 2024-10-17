const sortableLists = document.querySelectorAll("#sortable");
const pageContent = document.getElementById('page-content');
const previewElement = document.createElement("li");
const listPreviewElement = document.createElement('div');
const mainElement = document.querySelector('main');

previewElement.classList.add("preview");
listPreviewElement.classList.add('list');
listPreviewElement.classList.add('preview-list');

let initialX;
let initialY;
let sortableList;
let listYInterval;
let pageXInterval;
let upStart = false;
let selectedElement;
let startTouch = false;
let actualYPosition = 0;
let actualXPosition = 0;
let intervalPageXValue = 2;
let intervalListYValue = 2;

let startX = 0;
let scrollLeft = 0;
let mouseDown = false;

let listUpStart;
let initialListX;
let initialListY;
let listStartTouch;
let selectedMoveList;
let actualListXPosition = 0;

const allLists = pageContent.childNodes[1];
allLists.style.minWidth = Array.from(allLists.children).length * 320 + 'px'


Array.from(sortableLists).forEach(sortable => {
  listCoisas(sortable)

  Array.from(sortable.children).forEach((element) => {
    elementCoisas(element);
  });
})

function listCoisas(listElement) {
  listElement.setAttribute('height', listElement.offsetHeight);

  const listParent = listElement.parentElement.parentElement.parentElement

  const headerElement = listParent.querySelector('.header');

  headerElement.addEventListener("mousedown", (downEvent) => {
    if (listUpStart) return;

    downEvent.preventDefault();
    downEvent.stopImmediatePropagation();

    startTouch = true;

    listDownEventHandle(downEvent.clientX, downEvent.clientY, listParent)
  });

  headerElement.addEventListener("touchstart", (touchDownEvent) => {
    if (listUpStart) return;

    startTouch = true;
    const touch = touchDownEvent.touches[0];

    setTimeout(() => {
      if (!startTouch) return;

      listDownEventHandle(touch.pageX, touch.pageY, listParent);
    }, 500)
  })
}

const listDownEventHandle = (x, y, element) => {
  selectedMoveList = element;

  const listRect = selectedMoveList.getBoundingClientRect();

  Array.from(allLists.children).forEach(element => element.style.transition = "none");

  selectedMoveList.style.top = "unset";
  selectedMoveList.style.left = "unset";
  selectedMoveList.style.position = "fixed";
  selectedMoveList.style.zIndex = "2";
  selectedMoveList.style.transition = "none";
  selectedMoveList.style.height = listRect.height + 'px';
  selectedMoveList.style.width = listRect.width + 'px';
  selectedMoveList.style.transform = 'rotate(2deg)';
  selectedMoveList.style.opacity = '0.2'

  listPreviewElement.style.opacity = '1';
  listPreviewElement.style.height = listRect.height + 'px';
  listPreviewElement.style.width = listRect.width + 'px';

  actualListXPosition = x;
  initialListX = x - listRect.x;
  initialListY = y - listRect.y;

  selectedMoveList.style.top = y - initialListY + "px";
  selectedMoveList.style.left = x - initialListX + "px";

  const dragAfterListElementId = Array.from(allLists.children)
    .filter(el => el != listPreviewElement)
    .findIndex(el => el == selectedMoveList)

  Array.from(allLists.children)
    .filter(el => el != selectedMoveList && el != listPreviewElement)
    .forEach((element, id) => {
      element.style.transform = id > dragAfterListElementId - 1 ? "translateX(320px)" : "";

      setTimeout(() => {
        if (window.innerWidth >= 600)
          element.style.transition = "all 200ms ease-in-out";
      }, 0);
    })

  allLists.insertBefore(listPreviewElement, selectedMoveList);
  listPreviewElement.style.transform = `translateX(${dragAfterListElementId > 0 ? 320 * dragAfterListElementId : 0}px)`
}

const listMoveEventHandle = (x, y) => {
  actualListXPosition = x;

  if (!selectedMoveList) return;

  selectedMoveList.style.top = y - initialListY + "px";
  selectedMoveList.style.left = x - initialListX + "px";

  handlePageXInterval(x, true);

  const afterElement = getDragAfterListElement(x);

  const dragAfterListElementId = Array.from(allLists.children)
    .filter(el => el != listPreviewElement && el != selectedMoveList)
    .findIndex(el => el == afterElement)

  Array.from(allLists.children)
    .filter(el => el != selectedMoveList && el != listPreviewElement)
    .forEach((element, id) => {
      element.style.transform = id > dragAfterListElementId - 1 && dragAfterListElementId != -1 ? "translateX(320px)" : "";
    })

  allLists.insertBefore(listPreviewElement, afterElement)
  if (dragAfterListElementId != -1)
    listPreviewElement.style.transform = `translateX(${dragAfterListElementId > 0 ? 320 * dragAfterListElementId : 0}px)`
  else {
    const lenght = Array.from(allLists.children)
      .filter(el => el != selectedMoveList && el != listPreviewElement).length;

    listPreviewElement.style.transform = `translateX(${320 * lenght}px)`
  }
}

function elementCoisas(element) {
  element.addEventListener("mousedown", (downEvent) => {
    downEvent.preventDefault();
    downEvent.stopImmediatePropagation();

    if (upStart) return;

    if (downEvent.button == 2) {
      startTouch = false;
      if (listYInterval) clearInterval(listYInterval);
      if (pageXInterval) clearInterval(pageXInterval);
      listYInterval = null;
      pageXInterval = null;

      upEventHandle();
      return;
    };

    sortableList = element.parentElement;

    startTouch = true;
    downEventHandle(downEvent.clientX, downEvent.clientY, element);
  });

  element.addEventListener("touchstart", (touchDownEvent) => {
    if (upStart) return;

    sortableList = element.parentElement;
    const touch = touchDownEvent.touches[0];
    startTouch = true;

    setTimeout(() => {
      if (!startTouch) return;

      downEventHandle(touch.pageX, touch.pageY, element);
    }, 500)
  })
}

window.addEventListener("mousemove", (moveEvent) => {
  if (selectedMoveList) {
    moveEvent.preventDefault();
    moveEvent.stopImmediatePropagation();
    listMoveEventHandle(moveEvent.x, moveEvent.y);

    return;
  }

  if (!selectedElement || !startTouch) return;

  moveEvent.preventDefault();
  moveEvent.stopImmediatePropagation();

  moveEventHandle(moveEvent.x, moveEvent.y);
});

window.addEventListener("touchmove", (touchMoveEvent) => {
  startTouch = false;

  if (selectedMoveList) {
    const touch = touchMoveEvent.touches[0];

    touchMoveEvent.preventDefault();
    touchMoveEvent.stopImmediatePropagation();
    listMoveEventHandle(touch.pageX, touch.pageY);
    return;
  }

  if (!selectedElement) return;

  const touch = touchMoveEvent.touches[0];
  touchMoveEvent.preventDefault();
  touchMoveEvent.stopImmediatePropagation();

  moveEventHandle(touch.pageX, touch.pageY);
})

window.addEventListener("mouseup", (upEvent) => {
  startTouch = false;

  upEvent.preventDefault();
  upEvent.stopImmediatePropagation();

  if (selectedMoveList) return listUpEventHandle();

  upEventHandle();
});

window.addEventListener("touchend", () => {
  startTouch = false;
  if (selectedMoveList) return listUpEventHandle();
  upEventHandle();
})

const listUpEventHandle = () => {
  if (listYInterval) clearInterval(listYInterval);
  if (pageXInterval) clearInterval(pageXInterval);
  listYInterval = null;
  pageXInterval = null;

  if (!selectedMoveList) return;

  listUpStart = true;
  const clonedList = selectedMoveList;
  selectedMoveList = null;
  const previewRect = listPreviewElement.getBoundingClientRect();

  Array.from(allLists.children)
    .filter(el => el != clonedList && el != listPreviewElement).forEach(el => el.style.position = 'static');

  setTimeout(() => {
    allLists.insertBefore(clonedList, listPreviewElement)
    allLists.removeChild(listPreviewElement);

    clonedList.style.height = '';
    clonedList.style.width = '';

    Array.from(allLists.children).forEach(el => {
      el.style.transition = 'none';
      el.style.position = 'static';
      el.style.transform = 'none';
    });

    listUpStart = false;
  }, 400)

  listPreviewElement.style.opacity = "0";
  clonedList.style.transition = "all 200ms ease-in-out";
  clonedList.style.opacity = '1'
  clonedList.style.transform = 'rotate(0deg)';
  clonedList.style.top = Math.floor(previewRect.top) + "px";
  clonedList.style.left = Math.floor(previewRect.left) + "px";
}

const upEventHandle = () => {
  if (listYInterval) clearInterval(listYInterval);
  if (pageXInterval) clearInterval(pageXInterval);
  listYInterval = null;
  pageXInterval = null;

  if (!selectedElement) return;

  upStart = true;
  const previewIsFirst = getIsPreviewFirst();

  const elementHeight = selectedElement.offsetHeight;
  const previewRect = previewElement.getBoundingClientRect();

  Array.from(sortableList.children).filter(
    (el) => el != selectedElement && el != previewElement
  ).forEach(el => {
    el.style.position = 'static';
  });

  const cloneElement = selectedElement;

  setTimeout(() => {
    const afterElement = getDragAfterElement(actualYPosition);
    selectedElement = null;

    if (cloneElement.parentElement != sortableList) {
      const parentListHeight = +cloneElement.parentElement.getAttribute('height');

      cloneElement.parentElement.setAttribute('height', parentListHeight - cloneElement.offsetHeight)
      cloneElement.parentElement.style.height = parentListHeight - cloneElement.offsetHeight + 'px';
      cloneElement.parentElement.style.minHeight = parentListHeight - cloneElement.offsetHeight + 'px';

      const newListHeight = +sortableList.getAttribute('height');
      sortableList.setAttribute('height', newListHeight + cloneElement.offsetHeight + 5);
      sortableList.style.height = newListHeight + cloneElement.offsetHeight + 5 + 'px';
      sortableList.style.minHeight = newListHeight + cloneElement.offsetHeight + 5 + 'px';
    }

    cloneElement.parentElement.parentElement.parentElement.parentElement.style.zIndex = '1';

    sortableList.insertBefore(cloneElement, afterElement);

    cloneElement.style.position = "static";
    cloneElement.style.width = '100%';

    if (sortableList.contains(previewElement))
      sortableList.removeChild(previewElement);

    if (!afterElement)
      sortableList.parentElement.scrollTop += elementHeight;

    Array.from(sortableList.children).forEach((listElement) => {
      listElement.style.transition = "all 200ms ease-in-out";
      listElement.style.transition = "none";
      listElement.style.transform = "translateY(0px)";
    });

    cloneElement.style.zIndex = "2";
    cloneElement.removeEventListener('transitionend', () => { }, { capture: true });
    upStart = false;

    resizeAllLists();
  }, 400)

  previewElement.style.opacity = "0";
  selectedElement.style.transition = "all 200ms ease-in-out";
  selectedElement.style.top = Math.floor(previewRect.top) - (previewIsFirst ? 5 : 4) + "px";
  selectedElement.style.left = Math.floor(previewRect.left) + "px";
}

const changeList = (x, preventScroll) => {
  const list = Array.from(sortableLists).find(list => {
    const rect = list.getBoundingClientRect();
    return x > rect.left - (preventScroll ? 0 : pageContent.scrollLeft) - 20 && x < (rect.right + 20 - (preventScroll ? 0 : pageContent.scrollLeft))
  })

  if (!list || list == sortableList) return;

  sortableList = list;
  const elementList = selectedElement.parentElement;

  Array.from(sortableLists)
    .filter(list => list != sortableList && list != elementList)
    .forEach(list => {
      const height = +list.getAttribute('height');

      list.style.minHeight = height + 'px';
      list.style.height = height + 'px';

      Array.from(list.children).forEach(el => el.style.transform = '');
    })

  if (elementList != list) {
    const elementHeight = selectedElement.getBoundingClientRect().height;

    const oldHeight = +sortableList.getAttribute('height')
    sortableList.style.minHeight = oldHeight + elementHeight + 5 + 'px';
    sortableList.style.height = oldHeight + elementHeight + 5 + 'px';

    const parentListHeight = +selectedElement.parentElement.getAttribute('height');
    selectedElement.parentElement.style.minHeight = parentListHeight - selectedElement.offsetHeight + 'px';
    selectedElement.parentElement.style.height = parentListHeight - selectedElement.offsetHeight + 'px';

    Array.from(sortableList.children).filter(el => el != previewElement).forEach(el => el.style.transition = "all 200ms ease-in-out")
    Array.from(selectedElement.parentElement.children).forEach(el => el.style.transform = '');
  } else {
    const oldHeight = +sortableList.getAttribute('height')
    sortableList.style.minHeight = oldHeight + 'px';
    sortableList.style.height = oldHeight + 'px';
  }
}

const downEventHandle = (x, y, element) => {
  selectedElement = element;
  const rect = selectedElement.getBoundingClientRect();

  sortableList.style.minHeight = +sortableList.getAttribute('height') + 'px';
  sortableList.style.height = +sortableList.getAttribute('height') + 'px';

  Array.from(sortableList.children)
    .forEach((el) => {
      el.style.transition = "none";
      el.removeEventListener('transitionend', () => { }, true);
    });

  selectedElement.style.top = "unset";
  selectedElement.style.left = "unset";
  selectedElement.style.position = "fixed";
  selectedElement.style.zIndex = "2";
  selectedElement.style.width = rect.width + "px";
  selectedElement.style.transition = "none";

  selectedElement.parentElement.parentElement.parentElement.parentElement.style.zIndex = '10';

  previewElement.style.display = "block";
  previewElement.style.width = rect.width + "px";
  previewElement.style.opacity = "1";

  actualYPosition = y
  initialX = x - rect.x;
  initialY = y - rect.y;

  selectedElement.style.top = y - initialY + "px";
  selectedElement.style.left = x - initialX + "px";

  const previewElementId = Array.from(sortableList.children).findIndex(
    (el) => el == selectedElement
  );

  Array.from(sortableList.children)
    .filter((el) => el != selectedElement && el != previewElement)
    .forEach((listElement, id) => {

      listElement.style.transform = id > previewElementId - 1 ? "translateY(44px)" : "";

      setTimeout(() => {
        listElement.style.transition = "all 200ms ease-in-out";
      }, 0);
    });

  const firstElementWidth = sortableList.children[0].offsetWidth;
  sortableList.insertBefore(previewElement, selectedElement);
  previewElement.style.width = firstElementWidth + 'px';

  const previewIsFirst = getIsPreviewFirst();

  previewElement.style.transform = previewIsFirst ? "translateY(5px)" : "translateY(-1px)";
}

const moveEventHandle = (x, y) => {
  actualXPosition = x;
  actualYPosition = y;

  handlePageXInterval(x);
  changeList(x, true);

  const afterElement = getDragAfterElement(y);
  previewElement.style.transition = 'none';
  const firstElementWidth = sortableList.children[0].offsetWidth;
  sortableList.insertBefore(previewElement, afterElement);
  previewElement.style.width = firstElementWidth + 'px';
  selectedElement.style.width = firstElementWidth + 'px';

  const previewIsFirst = getIsPreviewFirst();

  const previewElementId = Array.from(sortableList.children)
    .filter((el) => el != selectedElement)
    .findIndex((el) => el == previewElement);

  Array.from(sortableList.children)
    .filter((el) => el != selectedElement)
    .forEach((listElement, id) => {
      if (id > previewElementId) {
        listElement.style.transform = "translateY(44px)";
      } else {
        listElement.style.transform = "";
      }
    });

  previewElement.style.transform = previewIsFirst ? "translateY(5px)" : "translateY(-1px)";

  selectedElement.style.top = y - initialY + "px";
  selectedElement.style.left = x - initialX + "px";

  const listHeight = sortableList.parentElement.parentElement.offsetHeight;

  if (y < listHeight / 5) {
    if (listYInterval && intervalListYValue == -2) return;

    if (listYInterval) clearInterval(listYInterval);

    intervalListYValue = -2;
    listYInterval = createListYInterval(intervalListYValue);
    return;
  }

  if (y > listHeight - listHeight / 5) {
    if (listYInterval && intervalListYValue == 2) return;

    if (listYInterval) clearInterval(listYInterval);

    intervalListYValue = 2;
    listYInterval = createListYInterval(intervalListYValue);
    return;
  }

  if (listYInterval) clearInterval(listYInterval);
  listYInterval = null;
}

const handlePageXInterval = (x, isList) => {
  if (x < window.innerWidth / 4) {
    if (pageXInterval && intervalPageXValue == -2) return;

    if (pageXInterval) clearInterval(pageXInterval);

    intervalPageXValue = -2;

    pageXInterval = createPageXInterval(intervalPageXValue, isList);
    return;
  }

  if (x > window.innerWidth - window.innerWidth / 4) {
    if (pageXInterval && intervalPageXValue == 2) return;

    if (pageXInterval) clearInterval(pageXInterval);

    intervalPageXValue = 2;

    pageXInterval = createPageXInterval(intervalPageXValue, isList);
    return;
  }

  if (pageXInterval) clearInterval(pageXInterval);
  pageXInterval = null;
}

const resizeAllLists = () => {
  Array.from(sortableLists).forEach(sortable => {
    const allCardsHeight = Array.from(sortable.children).reduce((curr, prev) => {
      const height = prev.getBoundingClientRect().height;
      return curr + height + 5;
    }, 0)

    const totalHeight = Math.floor(allCardsHeight) + 10;

    sortable.style.height = totalHeight + 'px';
    sortable.setAttribute('height', totalHeight);
    sortable.style.minHeight = totalHeight + 'px';
  })
}

const createPageXInterval = (move, isList) => {
  return setInterval(() => {
    pageContent.scrollLeft += move;

    if (isList) {
      const afterElement = getDragAfterListElement(actualListXPosition);

      const dragAfterListElementId = Array.from(allLists.children)
        .filter(el => el != listPreviewElement && el != selectedMoveList)
        .findIndex(el => el == afterElement)

      Array.from(allLists.children)
        .filter(el => el != selectedMoveList && el != listPreviewElement)
        .forEach((element, id) => {
          element.style.transform = id > dragAfterListElementId - 1 && dragAfterListElementId != -1 ? "translateX(320px)" : "";
        })

      allLists.insertBefore(listPreviewElement, afterElement)
      if (dragAfterListElementId != -1)
        listPreviewElement.style.transform = `translateX(${dragAfterListElementId > 0 ? 320 * dragAfterListElementId : 0}px)`
      else {
        const lenght = Array.from(allLists.children)
          .filter(el => el != selectedMoveList && el != listPreviewElement).length;

        listPreviewElement.style.transform = `translateX(${320 * lenght}px)`
      }

      return;
    }

    changeList(actualXPosition - pageContent.scrollLeft);

    const afterElement = getDragAfterElement(actualYPosition);

    const firstElementWidth = sortableList.children[0].offsetWidth;
    sortableList.insertBefore(previewElement, afterElement);
    previewElement.style.width = firstElementWidth + 'px';
    selectedElement.style.width = firstElementWidth + 'px';

    const previewIsFirst = getIsPreviewFirst();

    const previewElementId = Array.from(sortableList.children)
      .filter((el) => el != selectedElement)
      .findIndex((el) => el == previewElement);

    Array.from(sortableList.children)
      .filter((el) => el != selectedElement)
      .forEach((listElement, id) => {
        if (id > previewElementId) {
          listElement.style.transform = "translateY(44px)";
        } else {
          listElement.style.transform = "";
        }
      });

    previewElement.style.transform = previewIsFirst ? "translateY(5px)" : "translateY(-1px)";
  }, 2)
}

const createListYInterval = (move) => {
  return setInterval(() => {
    sortableList.parentElement.parentElement.scrollTop += move;

    const afterElement = getDragAfterElement(actualYPosition);

    const firstElementWidth = sortableList.children[0].offsetWidth;
    sortableList.insertBefore(previewElement, afterElement);
    previewElement.style.width = firstElementWidth + 'px';
    selectedElement.style.width = firstElementWidth + 'px';
    const previewIsFirst = getIsPreviewFirst();

    const previewElementId = Array.from(sortableList.children)
      .filter((el) => el != selectedElement)
      .findIndex((el) => el == previewElement);

    Array.from(sortableList.children)
      .filter((el) => el != selectedElement)
      .forEach((listElement, id) => {
        if (id > previewElementId) {
          listElement.style.transform = "translateY(44px)";
        } else {
          listElement.style.transform = "";
        }
      });

    previewElement.style.transform = previewIsFirst ? "translateY(5px)" : "translateY(-1px)";
  }, 10);
};

const getDragAfterElement = (y) => {
  const draggableElements = Array.from(sortableList.children).filter(
    (el) => el != selectedElement && el != previewElement
  );

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child,
        };
      } else {
        return closest;
      }
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
};

const getDragAfterListElement = (x) => {
  const draggableElements = Array.from(allLists.children)
    .filter(el => el != selectedMoveList && el != listPreviewElement)

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;

      if (offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child,
        };
      } else {
        return closest;
      }
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
}

const getIsPreviewFirst = () => Array.from(sortableList.children).filter((el) => el != selectedElement).findIndex(element => element == previewElement) == 0;

// Move page with mouse

document.addEventListener('mousedown', (event) => {
  mouseDown = true;
  startX = event.pageX - pageContent.offsetLeft;
  scrollLeft = pageContent.scrollLeft;
})

document.addEventListener('mousemove', (event) => {
  if (selectedElement || !mouseDown) return;

  const x = event.pageX - document.body.scrollLeft;
  const scroll = x - startX;

  pageContent.scrollLeft = scrollLeft - scroll;
})

document.addEventListener('mouseup', () => {
  mouseDown = false;
})
document.addEventListener('mouseleave', () => {
  mouseDown = false;
})

