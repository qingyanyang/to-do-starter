/*****************************************************************************
 * Others - This section contains other utils, constants and others
 *****************************************************************************/
/**
 * Static Strings
 */
class TaskStrings {
    static emptyInputError = "Empty input! Please try again";
    static duplicateTaskError = "Task has already existed! Please try again";
    static exceedLengthError = "Task description has reached max length of 80!";
    static noResults = "No Results! Please check your spelling";
    static noTasks = "No tasks here, write your task and click '+'";
}

/**
 * Enum for error types
 */
const ErrorType = {
    EMPTY: "empty",
    DUPLICATE: "duplicate",
    EXCEED: "exceed",
};

/*****************************************************************************
 * Model - This section contains data structure and operate methods
 *****************************************************************************/
/**
 * Dynamic variable storing the list of tasks.
 * Example task format: [{ taskName: 'ask him out', completed: true }]
 */
let tasks = [];

/**
 * Functions to operate taskschange
 */
// 1. add task
const addTask = (taskName) => {
    // create new task
    const task = {
        taskName,
        completed: false
    }
    // add new task to task list
    tasks.push(task);
}

// 2. edit task
const editTask = (index, updatedTaskName) => {
    tasks[index].taskName = updatedTaskName;
}

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
}

// 3. delete task
const deleteTask = (index) => {
    // get indexed task and remove
    tasks.splice(index, 1);
}

// 4. search task
const searchTask = (keyword) => {
    return tasks.filter((task) => {
        return task.taskName.toLowerCase().includes(keyword.toLowerCase())
    });
}

/*****************************************************************************
 * Controllers - This section contains all the DOM operation logic
 *****************************************************************************/
/**
 * Initializes DOM elements and sets up event listeners.
 */
// user input
const input = document.getElementById("task-input");
// event buttons
const addButton = document.querySelector(".add-button");
const searchButton = document.querySelector(".search-button");
// data dispaly change views
const numbers = document.getElementById("numbers");
const progress = document.getElementById("progress");
const counterNumbers = document.getElementById("counter-numbers");
const errorInstruction = document.querySelector(".error-instruction");
const taskList = document.querySelector(".task-list");
const signContainer = document.querySelector(".sign-container");

// Event listeners
addButton.addEventListener("click", handleAddButtonClick);
searchButton.addEventListener("click", handleSearchButtonClick);
taskList.addEventListener("click", handleTaskListClick);

/**
 * Handles the add button click event to add a new task.
 */
function handleAddButtonClick(event) {
    event.preventDefault();
    const inputText = input.value.trim();
    if (!inputText) {
        renderErrorText({ errorType: ErrorType.EMPTY });
        return;
    }

    if (tasks.some(task => task.taskName === inputText)) {
        renderErrorText({ errorType: ErrorType.DUPLICATE });
        return;
    }

    addTask(inputText);
    renderTaskArea();
    renderProgress();
    scrollToBottom();
    input.value = "";
    renderCounter(input.value);
    input.style.height = "56px";
    input.focus();
}

/**
 * Handles the search button click event to filter tasks.
 */
function handleSearchButtonClick(event) {
    event.preventDefault();
    const inputText = input.value.trim();
    const searchedTasks = inputText ? searchTask(inputText) : tasks;
    renderTaskArea({ targetTask: searchedTasks, isSearch: !!inputText });
}

/**
 * Handles click events on the task list to edit, delete, or toggle completion of tasks.
 */
function handleTaskListClick(event) {
    const target = event.target;
    const index = target.dataset.index;

    if (target.classList.contains("edit-button")) {
        handleEditButtonClick(target, index);
    } else if (target.classList.contains("delete-button")) {
        handleDeleteButtonClick(index);
    } else if (target.classList.contains("task-check-box")) {
        handleCheckboxClick(index);
    }
}

/**
 * Handles logic for editing a task.
 */
function handleEditButtonClick(target, index) {
    const taskInputs = document.querySelectorAll(".task-edit-input");
    const editButton = target;
    const isEditing = editButton.textContent === "Edit";

    editButton.textContent = isEditing ? "Save" : "Edit";
    taskInputs[index].disabled = !isEditing;

    if (!isEditing) {
        editTask(index, taskInputs[index].value);
        renderTaskArea();
    } else {
        taskInputs[index].focus();
        const value = taskInputs[index].value;
        taskInputs[index].value = "";  // Clear and reset the value to move cursor to end.
        taskInputs[index].value = value;
    }
}

/**
 * Handles logic for deleting a task.
 */
function handleDeleteButtonClick(index) {
    deleteTask(index);
    renderTaskArea();
    renderProgress();
}

/**
 * Handles logic for toggling task completion status.
 */
function handleCheckboxClick(index) {
    toggleTaskComplete(index);
    renderTaskArea();
    renderProgress();
}

/**
 * Function to control UI
 */
function autoGrow(element, initalHeight) {
    element.style.height = `${initalHeight}px`;
    element.style.height = (element.scrollHeight) + "px";
    renderCounter(element.value);
}

function scrollToBottom() {
    taskList.scrollTop = taskList.scrollHeight;
}

/*****************************************************************************
 * Views - This section contains all the DOM rendering functions
 *****************************************************************************/
/**
 * Renders an error message based on the specified error type.
 */
const renderErrorText = ({ errorType }) => {
    errorInstruction.innerHTML = "";  // Clear any previous error messages.
    let errorText = "";
    // Determine the appropriate error message based on the error type.
    switch (errorType) {
        case ErrorType.EMPTY:
            errorText = TaskStrings.emptyInputError;
            break;
        case ErrorType.DUPLICATE:
            errorText = TaskStrings.duplicateTaskError;
            break;
            case ErrorType.EXCEED:
            errorText = TaskStrings.exceedLengthError;
            break;
        default:
            throw new Error("Unsupported error type: " + errorType);
    }

    // Create and append the error message to the error instruction container.
    const errorContainer = document.createElement("div");
    errorContainer.innerHTML = `<p>${errorText}</p>`;
    errorInstruction.append(errorContainer);
}

/**
 * Displays a no-task sign based on whether the view is the result of a search.
 */
const renderNoTaskSign = (isSearch) => {
    const noTaskSign = document.createElement("div");
    const noSignText = isSearch ? TaskStrings.noResults : TaskStrings.noTasks;

    // Set the text and append the no-task sign to the sign container.
    noTaskSign.innerHTML = `<div class="no-task-sign"><p>${noSignText}</p></div>`;
    signContainer.append(noTaskSign);
}

/**
 * Renders the task area, either showing tasks or a no-task sign if empty.
 */
const renderTaskArea = ({ targetTask = tasks, isSearch = false } = {}) => {
    taskList.innerHTML = "";      // Clear the task list.
    signContainer.innerHTML = ""; // Clear the sign container.
    errorInstruction.innerHTML = ""; // Clear any previous error messages.

    if (targetTask.length > 0) {
        targetTask.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.innerHTML = `

                <div class="task-item">
                    <div class="left-part ${task.completed ? "completed" : ""}">
                        <input type="checkbox" class="task-check-box" data-index="${index}" ${task.completed ? "checked" : ""}> 

                <textArea class="task-edit-input" data-index="${index}" disabled maxlength="80">${task.taskName}</textArea>
    
                    </div>
                    <div class="right-part">
                        <button class="text-button edit-button" data-index="${index}">Edit</button>
                        <img class="delete-button" src="./img/bin.png" data-index="${index}">
                    </div>
                    </div>
                
              `;
            taskList.append(taskItem);
        });
    } else {
        renderNoTaskSign(isSearch);  // Display a no-task sign if no tasks are available.
    }
}

/**
 * Updates and displays the progress of task completion.
 */
const renderProgress = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progressRatio = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Update the progress bar and display the number of completed tasks.
    progress.style.width = `${progressRatio}%`;
    numbers.innerText = `${completedTasks} / ${totalTasks}`;
}

/**
 * Updates and displays conter for length of task.
 */
const renderCounter = (value) => {
    counterNumbers.innerText = `${value.length} / 80`;
    if (value.length === 80) {
        counterNumbers.style.color = "#de3e53";
        renderErrorText({ errorType: ErrorType.EXCEED });
    } else {
        counterNumbers.style.color = "#ffffff";
        errorInstruction.innerHTML = "";
    }
}
