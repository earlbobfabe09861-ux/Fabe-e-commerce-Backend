const API_URL = "http://localhost:5000/api/users";

// Load users
async function loadUsers() {
  const res = await fetch(API_URL);
  const users = await res.json();

  const table = document.getElementById("userTable").querySelector("tbody");
  table.innerHTML = "";

  users.forEach(user => {
    table.innerHTML += `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editUser('${user._id}','${user.name}','${user.email}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Form submit
document.getElementById("userForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  });

  resetForm();
  loadUsers();
});

// Edit user
function editUser(id, name, email) {
  document.getElementById("userId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;

  document.getElementById("saveBtn").textContent = "Update User";
  document.getElementById("cancelBtn").classList.remove("d-none");
}

// Delete user
async function deleteUser(id) {
  if (confirm("Are you sure?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadUsers();
  }
}

// Reset form
function resetForm() {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
  document.getElementById("saveBtn").textContent = "Add User";
  document.getElementById("cancelBtn").classList.add("d-none");
}

document.getElementById("cancelBtn").addEventListener("click", resetForm);

// Initial load
loadUsers();
