let users =
  JSON.parse(localStorage.getItem("homeworkUsers")) || [];

let currentUsername =
  localStorage.getItem("homeworkCurrentUser");


function saveUsers() {
  localStorage.setItem(
    "homeworkUsers",
    JSON.stringify(users)
  );
}


function getUser() {
  return users.find(
    user => user.username === currentUsername
  );
}


/* LOGIN / REGISTER */

function showRegister() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("registerPage").style.display = "flex";
}


function showLogin() {
  document.getElementById("registerPage").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
}


function register() {

  const username =
    document.getElementById("regUser").value.trim();

  const password =
    document.getElementById("regPass").value;

  const error =
    document.getElementById("regError");

  error.textContent = "";

  if (!username || !password) {
    error.textContent = "กรอกข้อมูลให้ครบก่อน";
    return;
  }

  if (
    users.some(
      user => user.username === username
    )
  ) {
    error.textContent = "ชื่อผู้ใช้นี้มีอยู่แล้ว";
    return;
  }

  users.push({
    username: username,
    password: password,
    tasks: []
  });

  saveUsers();

  currentUsername = username;

  localStorage.setItem(
    "homeworkCurrentUser",
    username
  );

  openMain();
}


function login() {

  const username =
    document.getElementById("loginUser").value.trim();

  const password =
    document.getElementById("loginPass").value;

  const user =
    users.find(
      item =>
        item.username === username &&
        item.password === password
    );

  if (!user) {
    document.getElementById("loginError").textContent =
      "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    return;
  }

  currentUsername = username;

  localStorage.setItem(
    "homeworkCurrentUser",
    username
  );

  openMain();
}


function logout() {

  currentUsername = null;

  localStorage.removeItem(
    "homeworkCurrentUser"
  );

  document.getElementById("mainPage").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
}


/* OPEN MAIN */

function openMain() {

  const user = getUser();

  if (!user) return;

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("registerPage").style.display = "none";
  document.getElementById("mainPage").style.display = "block";

  document.getElementById("currentUser").textContent =
    "👤 " + user.username;

  showTasks();
}


/* MODAL */

function openAdd() {

  document.getElementById("taskForm").reset();

  document.getElementById("editId").value = "";

  document.getElementById("modalTitle").textContent =
    "เพิ่มงาน";

  document.getElementById("taskModal").classList.add("show");
}


function closeModal() {

  document.getElementById("taskModal").classList.remove("show");
}


/* SAVE TASK */

function init() {

  const form =
    document.getElementById("taskForm");

  if (form) {

    form.addEventListener("submit", function(event) {

      event.preventDefault();

      const user = getUser();

      if (!user) return;

      const name =
        document.getElementById("taskName").value.trim();

      const subject =
        document.getElementById("taskSubject").value;

      const date =
        document.getElementById("taskDate").value;

      const detail =
        document.getElementById("taskDetail").value.trim();

      const editId =
        document.getElementById("editId").value;

      if (editId) {

        const task =
          user.tasks.find(
            item => item.id === Number(editId)
          );

        if (task) {
          task.name = name;
          task.subject = subject;
          task.date = date;
          task.detail = detail;
        }

      } else {

        user.tasks.push({
          id: Date.now(),
          name: name,
          subject: subject,
          date: date,
          detail: detail,
          done: false
        });

      }

      saveUsers();
      showTasks();
      closeModal();

    });
  }

  if (currentUsername) {
    openMain();
  }
}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


/* SHOW TASKS */

function showTasks() {

  const user = getUser();

  if (!user) return;

  const search =
    document.getElementById("searchInput")
      .value.toLowerCase();

  const subject =
    document.getElementById("subjectFilter").value;

  let tasks =
    user.tasks.filter(task => {

      const found =
        task.name
          .toLowerCase()
          .includes(search);

      const correctSubject =
        subject === "" ||
        task.subject === subject;

      return found && correctSubject;
    });

  const unfinished =
    tasks.filter(task => !task.done);

  const finished =
    tasks.filter(task => task.done);

  document.getElementById("workCount").textContent =
    user.tasks.filter(task => !task.done).length;

  showUnfinished(unfinished);
  showFinished(finished);
}


/* UNFINISHED */

function showUnfinished(tasks) {

  const list =
    document.getElementById("taskList");

  if (tasks.length === 0) {

    list.innerHTML = `
      <div class="empty">
        ตอนนี้ไม่มีงานที่ต้องทำ
      </div>
    `;

    return;
  }

  list.innerHTML =
    tasks.map(task => `

      <div class="task">

        <button
          class="check-btn"
          onclick="finishTask(${task.id})">
        </button>

        <div class="task-info">

          <strong>
            ${safe(task.name)}
          </strong>

          <small>
            ${safe(task.subject)}
            •
            ส่ง ${formatDate(task.date)}
          </small>

        </div>

        <div class="task-buttons">

          <button
            onclick="editTask(${task.id})">
            ✏️
          </button>

          <button
            class="delete"
            onclick="deleteTask(${task.id})">
            🗑️
          </button>

        </div>

      </div>

    `).join("");
}


/* FINISHED */

function showFinished(tasks) {

  const list =
    document.getElementById("finishedList");

  if (tasks.length === 0) {

    list.innerHTML = `
      <div class="empty">
        ยังไม่มีงานที่ทำเสร็จ
      </div>
    `;

    return;
  }

  list.innerHTML =
    tasks.map(task => `

      <div class="finished">

        <button
          class="check-btn"
          onclick="finishTask(${task.id})">
          ✓
        </button>

        <strong>
          ${safe(task.name)}
        </strong>

      </div>

    `).join("");
}


/* FINISH */

function finishTask(id) {

  const user = getUser();

  if (!user) return;

  const task =
    user.tasks.find(
      item => item.id === id
    );

  if (!task) return;

  task.done = !task.done;

  saveUsers();
  showTasks();
}


/* EDIT */

function editTask(id) {

  const user = getUser();

  if (!user) return;

  const task =
    user.tasks.find(
      item => item.id === id
    );

  if (!task) return;

  document.getElementById("editId").value = task.id;

  document.getElementById("taskName").value =
    task.name;

  document.getElementById("taskSubject").value =
    task.subject;

  document.getElementById("taskDate").value =
    task.date;

  document.getElementById("taskDetail").value =
    task.detail || "";

  document.getElementById("modalTitle").textContent =
    "แก้ไขงาน";

  document.getElementById("taskModal").classList.add("show");
}


/* DELETE */

function deleteTask(id) {

  const user = getUser();

  if (!user) return;

  const answer =
    confirm("ต้องการลบงานนี้หรือไม่?");

  if (!answer) return;

  user.tasks =
    user.tasks.filter(
      task => task.id !== id
    );

  saveUsers();
  showTasks();
}


/* DATE */

function formatDate(date) {

  if (!date) return "-";

  const parts = date.split("-");

  if (parts.length !== 3) return date;

  return `${Number(parts[2])} ${getThaiMonth(Number(parts[1]))}`;
}


function getThaiMonth(month) {

  const months = [
    "",
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค."
  ];

  return months[month] || "";
}


/* SEARCH / FILTER */

document.addEventListener("input", function(event) {

  if (
    event.target.id === "searchInput" ||
    event.target.id === "subjectFilter"
  ) {
    showTasks();
  }

});


/* ป้องกันข้อความ HTML แปลก ๆ */

function safe(text) {

  const div =
    document.createElement("div");

  div.textContent = text || "";

  return div.innerHTML;
}
