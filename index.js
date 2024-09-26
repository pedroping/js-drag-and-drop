const sortableList = document.getElementById("sortable");
const previewElement = document.createElement("li");
previewElement.classList.add("preview");

let initialX;
let initialY;
let interval;
let initialHeight;
let selectedElement;
let intervalValue = 2;

Array.from(sortableList.children).forEach((element) => {
  elementCoisas(element);
});

function elementCoisas(element) {
  element.addEventListener("mousedown", (downEvent) => {
    downEvent.preventDefault();
    downEvent.stopImmediatePropagation();
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

    initialX = downEvent.clientX - rect.x;
    initialY = downEvent.clientY - rect.y;

    selectedElement.style.top = downEvent.clientY - initialY + "px";
    selectedElement.style.left = downEvent.clientX - initialX + "px";

    const previewElementId = Array.from(sortableList.children).findIndex(
      (el) => el == selectedElement
    );

    Array.from(sortableList.children)
      .filter((el) => el != selectedElement && el != previewElement)
      .forEach((listElement, id) => {
        listElement.style.transform = id > previewElementId - 1 ? "translateY(45px)" : "";

        setTimeout(() => {
          listElement.style.transition = "all 200ms ease-in-out";
        }, 5);
      });

    setTimeout(() => {
      sortableList.insertBefore(previewElement, selectedElement);
    }, 5);
  });
}

window.addEventListener("mousemove", (moveEvent) => {
  moveEvent.preventDefault();
  moveEvent.stopImmediatePropagation();

  if (!selectedElement) return;

  const afterElement = getDragAfterElement(moveEvent.y);

  sortableList.insertBefore(previewElement, afterElement);

  if (moveEvent.y < sortableList.parentElement.offsetHeight / 2.5) {
    if (interval || intervalValue != -2) clearInterval(interval);
    intervalValue = -2;
    interval = createInterval(intervalValue, moveEvent.y, moveEvent.x);
  } else if (moveEvent.y > sortableList.parentElement.offsetHeight - sortableList.parentElement.offsetHeight / 2.5) {
    if (interval || intervalValue != 2) clearInterval(interval);
    intervalValue = 2;
    interval = createInterval(intervalValue, moveEvent.y, moveEvent.x);
  } else {
    if (interval) clearInterval(interval);
    interval = null;
  }

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

  selectedElement.style.top = moveEvent.y - initialY + "px";
  selectedElement.style.left = moveEvent.x - initialX + "px";
});

window.addEventListener("mouseup", (upEvent) => {
  if (interval) clearInterval(interval);
  if (!selectedElement) return;

  const elementHeight = selectedElement.offsetHeight;
  const previewRect = previewElement.getBoundingClientRect();

  const afterElement = getDragAfterElement(upEvent.y);

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
});

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

const createInterval = (move, positionY, positionX) => {
  return setInterval(() => {
    const afterElement = getDragAfterElement(positionY);

    sortableList.parentElement.scrollTop += move;

    sortableList.insertBefore(previewElement, afterElement);

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

    selectedElement.style.top = positionY - initialY + "px";
    selectedElement.style.left = positionX - initialX + "px";
  }, 10);
};

