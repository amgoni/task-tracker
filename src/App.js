import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import About from "./components/About";

const firebaseURL = "https://task-tracker-a9409-default-rtdb.firebaseio.com/";

const App = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const getTasks = async () => {
      const tasksFromServer = await fetchTasks();
      setTasks(tasksFromServer);
    };

    getTasks();
  }, []);

  // Fetch Tasks
  const fetchTasks = async () => {
    const res = await fetch(`${firebaseURL}tasks.json`);
    const data = await res.json();

    if (data) {
      const tasksArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      return tasksArray;
    }

    return [];
  };

  // Fetch Task
  const fetchTask = async (id) => {
    const res = await fetch(`${firebaseURL}tasks/${id}.json`);
    const data = await res.json();

    return { id, ...data };
  };

  // Add Task
  const addTask = async (task) => {
    const res = await fetch(`${firebaseURL}tasks.json`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(task),
    });

    const data = await res.json();

    setTasks([...tasks, { id: data.name, ...task }]);
  };

  // Delete Task
  const deleteTask = async (id) => {
    const res = await fetch(`${firebaseURL}tasks/${id}.json`, {
      method: "DELETE",
    });

    if (res.status === 200) {
      setTasks(tasks.filter((task) => task.id !== id));
    } else {
      alert("Error Deleting This Task");
    }
  };

  // Toggle Reminder
  const toggleReminder = async (id) => {
    const taskToToggle = await fetchTask(id);
    const updTask = { ...taskToToggle, reminder: !taskToToggle.reminder };

    const res = await fetch(`${firebaseURL}tasks/${id}.json`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(updTask),
    });

    const data = await res.json();

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, reminder: data.reminder } : task
      )
    );
  };

  return (
    <Router>
      <div className="container">
        <Header
          onAdd={() => setShowAddTask(!showAddTask)}
          showAdd={showAddTask}
          title="47's Task Tracker"
        />
        <Routes>
          <Route
            path="/"
            element={
              <>
                {showAddTask && <AddTask onAdd={addTask} />}
                {tasks.length > 0 ? (
                  <Tasks
                    tasks={tasks}
                    onDelete={deleteTask}
                    onToggle={toggleReminder}
                  />
                ) : (
                  "No Tasks To Show"
                )}
              </>
            }
          />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
