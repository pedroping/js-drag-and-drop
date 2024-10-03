const sortableList = document.getElementById("sortable");
const previewElement = document.createElement("li");
previewElement.classList.add("preview");

let initialX;
let initialY;
let interval;
let initialHeight;
let selectedElement;
let intervalValue = 2;
let actualYPosition = 0;

let startTouch = false;
let initialPositions = {
  x: 0,
  y: 0
}


Array.from(sortableList.children).forEach((element) => {
  elementCoisas(element);
});

function elementCoisas(element) {
  element.addEventListener("mousedown", (downEvent) => {
    downEvent.preventDefault();
    downEvent.stopImmediatePropagation();

    startTouch = true;
    initialPositions = {
      x: downEvent.clientX,
      y: downEvent.clientY
    }

    downEventHandle(initialPositions.x, initialPositions.y, element);
  });

  element.addEventListener("touchstart", (touchDownEvent) => {
    console.log('Touch');

    startTouch = true;
    const touch = touchDownEvent.touches[0];
    initialPositions = {
      x: touch.pageX,
      y: touch.pageY
    }

    setTimeout(() => {
      if (!startTouch) return;
      console.log('Touch start');

      touchDownEvent.preventDefault();
      touchDownEvent.stopImmediatePropagation();
      downEventHandle(initialPositions.x, initialPositions.y, element);
    }, 500)
  })

}

window.addEventListener("mousemove", (moveEvent) => {
  initialPositions = {
    x: moveEvent.x,
    y: moveEvent.y
  }

  if (!selectedElement || !startTouch) return;

  moveEvent.preventDefault();
  moveEvent.stopImmediatePropagation();

  moveEventHandle(moveEvent.x, moveEvent.y);
});

window.addEventListener("touchmove", (touchMoveEvent) => {
  startTouch = false;

  const touch = touchMoveEvent.touches[0];

  initialPositions = {
    x: touch.pageX,
    y: touch.pageY
  }

  touchMoveEvent.stopImmediatePropagation();

  if (!selectedElement) return;

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
})

const moveEventHandle = (x, y) => {
  const afterElement = getDragAfterElement(y);

  sortableList.insertBefore(previewElement, afterElement);

  const previewIsFirst = Array.from(sortableList.children).filter((el) => el != selectedElement).findIndex(element => element == previewElement) == 0;

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
    interval = createInterval(intervalValue);
    return;
  }

  if (y > sortableList.parentElement.offsetHeight - sortableList.parentElement.offsetHeight / 5) {
    if (interval && intervalValue == 2) return;

    if (interval) clearInterval(interval);

    intervalValue = 2;
    interval = createInterval(intervalValue);
    return;
  }

  if (interval) clearInterval(interval);
  interval = null;
}

const downEventHandle = (x, y, element) => {
  selectedElement = element;

  Array.from(sortableList.children)
    .filter((el) => el != selectedElement)
    .forEach((el) => {
      el.style.transition = "none";
    });

  const rect = selectedElement.getBoundingClientRect();

  initialHeight = sortableList.offsetHeight;
  sortableList.style.minHeight = initialHeight + 'px';
  sortableList.style.height = initialHeight + 'px';

  selectedElement.style.top = "unset";
  selectedElement.style.left = "unset";
  selectedElement.style.position = "fixed";
  selectedElement.style.zIndex = "2";
  previewElement.style.display = "block";
  previewElement.style.width = rect.width + "px";
  previewElement.style.opacity = "1";
  selectedElement.style.width = rect.width + "px";
  selectedElement.style.transition = "none";

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

  const previewIsFirst = Array.from(sortableList.children).filter((el) => el != selectedElement).findIndex(element => element == previewElement) == 0;

  if (previewIsFirst) previewElement.style.transform = "translateY(5px)";
}

const upEventHandle = (y) => {
  const elementHeight = selectedElement.offsetHeight;
  const previewRect = previewElement.getBoundingClientRect();

  const afterElement = getDragAfterElement(y);

  const cloneElement = selectedElement;
  previewElement.style.opacity = "0";
  selectedElement.style.transition = "all 200ms ease-in-out";
  selectedElement.style.top = Math.floor(previewRect.top) - 2 + "px";
  selectedElement.style.left = Math.floor(previewRect.left) - 4 + "px";
  selectedElement = null;

  setTimeout(() => {
    cloneElement.style.position = "static";
    cloneElement.style.width = "100%";

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
  }, 100);
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

const createInterval = (move) => {
  return setInterval(() => {

    sortableList.parentElement.scrollTop += move;

    const afterElement = getDragAfterElement(actualYPosition);

    sortableList.insertBefore(previewElement, afterElement);
    const previewIsFirst = Array.from(sortableList.children).filter((el) => el != selectedElement).findIndex(element => element == previewElement) == 0;
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

