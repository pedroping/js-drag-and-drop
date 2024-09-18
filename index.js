
const sortableList = document.getElementById("sortable");
const previewElement = document.createElement("li");
previewElement.classList.add("preview");
let initialX;
let initialY;
let selectedElement;

Array.from(sortableList.children).forEach((element) => {
  elementCoisas(element);
});

function elementCoisas(element) {
  let isDown = false;
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

    selectedElement.style.top = "unset";
    selectedElement.style.left = "unset";
    selectedElement.style.position = "fixed";
    previewElement.style.display = "block";
    previewElement.style.width = rect.width + "px";
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
        if (id > previewElementId - 1) {
          listElement.style.transform = "translateY(45px)";
        } else {
          listElement.style.transform = "";
        }

        setTimeout(() => {
          listElement.style.transition = "all 200ms ease-in-out";
        }, 5);
      });

    sortableList.insertBefore(previewElement, selectedElement);
  });
}

window.addEventListener("mousemove", (moveEvent) => {
  moveEvent.preventDefault();
  moveEvent.stopImmediatePropagation();

  if (!selectedElement) return;

  const afterElement = getDragAfterElement(moveEvent.y);

  if (afterElement) {
    sortableList.insertBefore(previewElement, afterElement);
  } else {
    sortableList.insertBefore(previewElement, null);
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
  if (!selectedElement) return;

  const previewRect = previewElement.getBoundingClientRect();

  if (sortableList.contains(previewElement))
    sortableList.removeChild(previewElement);

  const afterElement = getDragAfterElement(upEvent.y);

  const cloneElement = selectedElement;

  selectedElement.style.transition = "all 200ms ease-in-out";
  selectedElement.style.top = Math.floor(previewRect.top) - 2 + "px";
  selectedElement.style.left = Math.floor(previewRect.left) - 4 + "px";
  selectedElement = null;

  setTimeout(() => {
    cloneElement.style.position = "static";

    if (afterElement) {
      sortableList.insertBefore(cloneElement, afterElement);
    } else {
      sortableList.insertBefore(cloneElement, null);
    }

    Array.from(sortableList.children).forEach((listElement) => {
      listElement.style.transition = "all 200ms ease-in-out";
      listElement.style.transition = "none";
      listElement.style.transform = "translateY(0px)";
    });
  }, 100);
});

const getDragAfterElement = (y) => {
  const draggableElements = Array.from(sortableList.children).filter(
    (el) => el != selectedElement
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
