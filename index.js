const sortableLists = document.querySelectorAll("#sortable");
const previewElement = document.createElement("li");
previewElement.classList.add("preview");

let initialX;
let initialY;
let interval;
let sortableList;
let selectedElement;
let intervalValue = 2;
let actualYPosition = 0;
let startTouch = false;
let preventListener = false;

Array.from(sortableLists).forEach(sortable => {
  listCoisas(sortable)

  Array.from(sortable.children).forEach((element) => {
    elementCoisas(element);
  });
})

function listCoisas(listElement) {
  listElement.setAttribute('height', listElement.offsetHeight);
}

function elementCoisas(element) {
  element.addEventListener("mousedown", (downEvent) => {
    downEvent.preventDefault();
    downEvent.stopImmediatePropagation();

    sortableList = element.parentElement;

    startTouch = true;
    downEventHandle(downEvent.clientX, downEvent.clientY, element);
  });

  element.addEventListener("touchstart", (touchDownEvent) => {
    startTouch = true;
    sortableList = element.parentElement;
    const touch = touchDownEvent.touches[0];

    setTimeout(() => {
      if (!startTouch) return;

      touchDownEvent.preventDefault();
      touchDownEvent.stopImmediatePropagation();
      downEventHandle(touch.pageX, touch.pageY, element);

      sortableList.parentElement.addEventListener("wheel", (e) => {
        e.preventDefault()
      }, { passive: false })
    }, 500)
  })
}

window.addEventListener("mousemove", (moveEvent) => {
  if (!selectedElement || !startTouch) return;

  moveEvent.preventDefault();
  moveEvent.stopImmediatePropagation();

  moveEventHandle(moveEvent.x, moveEvent.y);
});

window.addEventListener("touchmove", (touchMoveEvent) => {
  startTouch = false;

  const touch = touchMoveEvent.touches[0];

  touchMoveEvent.preventDefault();
  touchMoveEvent.stopImmediatePropagation();

  if (!selectedElement) return;

  sortableList.parentElement.style.touchAction = "none";

  moveEventHandle(touch.pageX, touch.pageY);
})

window.addEventListener("mouseup", (upEvent) => {
  startTouch = false;
  if (interval) clearInterval(interval);
  if (!selectedElement) return;

  upEventHandle(upEvent.y);
});

window.addEventListener("touchend", (touchEndEvent) => {
  startTouch = false;
  if (interval) clearInterval(interval);
  if (!selectedElement) return;

  const touch = touchEndEvent.changedTouches[0];
  upEventHandle(touch.pageY);
  sortableList.parentElement.style.touchAction = "";
  sortableList.parentElement.removeEventListener("wheel", () => { }, { passive: false });
})

window.addEventListener("touchend", () => {
  sortableList.parentElement.style.touchAction = "";
  sortableList.parentElement.removeEventListener("wheel", () => { }, { passive: false });
})

const changeList = (x) => {
  const list = Array.from(sortableLists).find(list => {
    const rect = list.getBoundingClientRect();
    return x > rect.left && x < (rect.left + rect.width)
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
    sortableList.style.minHeight = oldHeight + elementHeight + 'px';
    sortableList.style.height = oldHeight + elementHeight + 'px';

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

      listElement.style.transform = id > previewElementId - 1 ? "translateY(45px)" : "";

      setTimeout(() => {
        listElement.style.transition = "all 200ms ease-in-out";
      }, 0);
    });

  sortableList.insertBefore(previewElement, selectedElement);

  const previewIsFirst = getIsPreviewFirst();

  if (previewIsFirst) previewElement.style.transform = "translateY(5px)";
}

const moveEventHandle = (x, y) => {
  changeList(x);
  const afterElement = getDragAfterElement(y);
  previewElement.style.transition = 'none';
  sortableList.insertBefore(previewElement, afterElement);
  const previewIsFirst = getIsPreviewFirst();

  const previewElementId = Array.from(sortableList.children)
    .filter((el) => el != selectedElement)
    .findIndex((el) => el == previewElement);

  Array.from(sortableList.children)
    .filter((el) => el != selectedElement)
    .forEach((listElement, id) => {
      if (id > previewElementId) {
        listElement.style.transform = "translateY(45px)";
      } else {
        listElement.style.transform = "";
      }
    });

  if (previewIsFirst) previewElement.style.transform = "translateY(5px)";

  selectedElement.style.top = y - initialY + "px";
  selectedElement.style.left = x - initialX + "px";

  actualYPosition = y;

  if (y < sortableList.parentElement.offsetHeight / 5) {
    if (interval && intervalValue == -2) return;

    if (interval) clearInterval(interval);

    intervalValue = -2;
    interval = createListYInterval(intervalValue);
    return;
  }

  if (y > sortableList.parentElement.offsetHeight - sortableList.parentElement.offsetHeight / 5) {
    if (interval && intervalValue == 2) return;

    if (interval) clearInterval(interval);

    intervalValue = 2;
    interval = createListYInterval(intervalValue);
    return;
  }

  if (interval) clearInterval(interval);
  interval = null;
}

const upEventHandle = (y) => {
  const elementHeight = selectedElement.offsetHeight;
  const previewRect = previewElement.getBoundingClientRect();

  const afterElement = getDragAfterElement(y);

  const cloneElement = selectedElement;

  let hasLeft = false;
  let hasTop = false;

  preventListener = false;

  cloneElement.addEventListener('transitionend', (e) => {
    if (preventListener) return;

    if (e.propertyName == 'left')
      hasLeft = true;

    if (e.propertyName == 'top')
      hasTop = true;

    if (hasLeft && hasTop) {
      preventListener = true;
      cloneElement.style.position = "static";

      if (cloneElement.parentElement != sortableList) {
        const parentListHeight = +cloneElement.parentElement.getAttribute('height');

        cloneElement.parentElement.setAttribute('height', parentListHeight - cloneElement.offsetHeight)
        cloneElement.parentElement.style.height = parentListHeight - cloneElement.offsetHeight + 'px';
        cloneElement.parentElement.style.minHeight = parentListHeight - cloneElement.offsetHeight + 'px';

        const newListHeight = +sortableList.getAttribute('height');

        sortableList.style.height = newListHeight + cloneElement.offsetHeight + 'px';
        sortableList.style.minHeight = newListHeight + cloneElement.offsetHeight + 'px';
      }

      sortableList.insertBefore(cloneElement, afterElement);

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
      return;
    }
  })

  previewElement.style.opacity = "0";
  selectedElement.style.transition = "all 200ms ease-in-out";
  selectedElement.style.top = Math.floor(previewRect.top) - 5 + "px";
  selectedElement.style.left = Math.floor(previewRect.left) + "px";
  selectedElement = null;
}

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

const createListYInterval = (move) => {
  return setInterval(() => {
    sortableList.parentElement.scrollTop += move;

    const afterElement = getDragAfterElement(actualYPosition);

    sortableList.insertBefore(previewElement, afterElement);
    const previewIsFirst = getIsPreviewFirst();

    const previewElementId = Array.from(sortableList.children)
      .filter((el) => el != selectedElement)
      .findIndex((el) => el == previewElement);

    Array.from(sortableList.children)
      .filter((el) => el != selectedElement)
      .forEach((listElement, id) => {
        if (id > previewElementId) {
          listElement.style.transform = "translateY(45px)";
        } else {
          listElement.style.transform = "";
        }
      });

    if (previewIsFirst) previewElement.style.transform = "translateY(5px)";
  }, 10);
};

const getIsPreviewFirst = () => Array.from(sortableList.children).filter((el) => el != selectedElement).findIndex(element => element == previewElement) == 0;
