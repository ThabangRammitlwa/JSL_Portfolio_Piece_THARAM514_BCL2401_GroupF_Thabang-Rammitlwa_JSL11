// TASK: import helper functions from utils
import { getTasks,deleteTask,patchTask,putTask,createNewTask } from './utils/taskFunctions.js';
// TASK: import initialData
import{initialData}from'./initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

/// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData()
// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filter-div'),
 showSideBarBtn: document.getElementById('show-side-bar-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
 themeSwitch: document.getElementById('switch'),
 createNewTaskBtn: document.getElementById('create-task-btn'),
  modalWindow: document.getElementById('modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
 titleInput: document.getElementById('title-input'),
  descriptionInput: document.getElementById('description-input'),
  selectStatus: document.getElementById('select-status'),
  sideBar: document.getElementById('side-bar'),
  addNewTask: document.getElementById('add-new-task'),
  sideBarDiv: document.getElementById('side-bar-div'),
  sideLogoDiv: document.getElementById('logo'),
  boardsNavLinks: document.getElementById('boards-nav-links'),
 hearder: document.getElementById('header'),
 deleteBoardBtn: document.getElementById('delete-board-btn'),
dropdownBtn: document.getElementById('dropdown-btn'),
editBoardBtn: document.getElementById('edit-board-btn'),
tasksContainer: document.querySelector('.tasks-container'),
cancelAddTaskBtn:document.getElementById('cancel-add-task-btn'),
cancelEditBtn:document.getElementById('cancel-edit-btn'),
deleteTaskBtn: document.getElementById('delet-task-btn'),
editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  editTaskForm: document.getElementById('edit-task-form'),
 
};

initializeData()

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener ('click',() => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board = boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener ('click',() => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').foreach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.add('active') 
    }
    else {
      btn.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() =>
   toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click' ,() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {(false);
    elements.filterDiv.style.display='none' ;
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block':'none'; 
}


/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
  
  const task_id = JSON.parse(localStorage.getItem('id'));
  const titleInput = elements.titleInput.value;
  const descriptionInput = elements.descriptionInput.value;
  const selectStatus = elements.selectStatus.value;


    const task = {
      'id': task_id,
	    'title': titleInput,
	    'description': descriptionInput,
	    'status': selectStatus,
      'board': activeBoard,

    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  elements.sideBar.style.display = show? 'block' : 'none';
  localStorage.setItem('showSideBar', show);


}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', document.body.classList.contains('light-theme')? 'enabled' : 'disabled');
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('title-input').value = task.title;
  document.getElementById('description-input').value = task.description;
  document.getElementById('status-select').value = task.status;


  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const newTitle = document.getElementById('title-input').value;
  const newDescription = document.getElementById('description-input').value;
  const newStatus = document.getElementById('select-status').value;
// Create an object with the updated task details
const updatedTask = {
  id: taskId,
  title: newTitle,
  description: newDescription,
  status: newStatus,
};

  // Update task using a hlper functoin
 
  patchTask(updatedTask)
  .then(() => {
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI()
  refreshTasksUI();
})
}
/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
};

function setupEventListeners() {

}