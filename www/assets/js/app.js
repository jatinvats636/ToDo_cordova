//auth state check
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";
  } else {
    // No user is signed in.
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";
  }
});

// recaptcha for phone
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("sUp", {
  size: "invisible",
  callback: function (response) {
    SignUp();
  },
});
// for otp verification
function VerifyOTP() {
  var userOTP = document.getElementById("otp_field").value;
  confirmationResult
    .confirm(userOTP)
    .then(function (result) {
      var user = result.user;
      console.log(user);
    })
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("Error : " + errorCode + "\n" + errorMessage);
      console.log(error);
    });
}

// for signup button
function SignUp() {
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;
  var userPhone = document.getElementById("phone_field").value;
  // if both fields are filled
  if (userEmail != "" && userPhone != "") {
    window.alert("!! You can't use both Email and Phone");
  }
  // if only email is entered
  else if (userEmail != "" && userPhone == "") {
    firebase
      .auth()
      .createUserWithEmailAndPassword(userEmail, userPass)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert("Error : " + errorCode + "\n" + errorMessage);
        // ...
      });
  }
  // if only phone is entered
  else if (userEmail == "" && userPhone != "") {
    document.getElementById("phone_field").style.display = "none";
    document.getElementById("email_field").style.display = "none";
    document.getElementById("password_field").style.display = "none";
    document.getElementById("or").style.display = "none";
    document.getElementById("sUp").style.display = "none";
    document.getElementById("vOTP").style.display = "block";
    document.getElementById("wrapper").style.height = "90px";
    document.getElementById("signin").disabled = "true";
    document.getElementById("reset").disabled = "true";

    var appVerifier = window.recaptchaVerifier;
    firebase
      .auth()
      .signInWithPhoneNumber(userPhone, appVerifier)
      .then(function (confirmationResult) {
        window.confirmationResult = confirmationResult;
      })
      .catch(function (error) {
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // window.alert("Error : " + errorCode + "\n" + errorMessage);
        console.log(error);
      });
  }
  // if both field are empty
  else {
    window.alert("!! Please enter Email or Phone");
  }
}

// for signin button
function SignIn() {
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(userEmail, userPass)
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      window.alert("Error : " + errorCode + "\n" + errorMessage);
      // ...
    });
}

// for signout button
function SignOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      // Sign-out successful.
    })
    .catch(function (error) {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      window.alert("Error : " + errorCode + " " + errorMessage);
    });
  window.location.reload();
}

// for reset button
function ResetPass() {
  var userEmail = document.getElementById("email_field").value;

  firebase
    .auth()
    .sendPasswordResetEmail(userEmail)
    .then(function () {
      // Email sent.
    })
    .catch(function (error) {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;

      window.alert("Error : " + errorCode + "\n" + errorMessage);
    });
}

Vue.filter("timeago", function (date) {
  return new timeago().format(date);
});

Vue.component("todo-list", {
  template: "#todo-list-template",
  data: function () {
    return {
      newTask: "",
      tasks: [
        {
          task: "Do something",
          priority: 2,
          created: Date.now(),
          completed: false,
        },
        {
          task: "Do something else",
          priority: 1,
          created: Date.now(),
          completed: true,
        },
      ],
      defaultSortBy: ["priority", "created"],
      defaultSortOrder: ["asc", "desc"],
      defaultTaskPriority: 2, // 1: high, 2: normal. 3: low
    };
  },
  created: function () {
    if (localStorage.todoData) {
      this.tasks = this.getData("todoData");
    } else {
      this.initApp();
    }
  },
  mounted: function () {
    new timeago().render(document.querySelectorAll(".timeago"));
  },
  methods: {
    togglePriority: function (task, priority) {
      task.updated = Date.now();
      task.priority = priority;
      this.sortTasks(this.defaultSortBy, this.defaultSortOrder);
      this.setData("todoData", this.tasks);
    },
    toggleTodoStatus: function (task) {
      task.updated = Date.now();
      task.completed = !task.completed;
      this.setData("todoData", this.tasks);
    },
    sortTasks: function (sortBy, sortOrder) {
      this.tasks = _.orderBy(this.tasks, sortBy, sortOrder);
    },
    deleteTodo: function (task) {
      task.updated = Date.now();
      this.tasks.splice(this.tasks.indexOf(task), 1);
      this.setData("todoData", this.tasks);
    },
    addTodo: function () {
      if (this.newTask.trim().length) {
        this.tasks.push({
          task: this.newTask,
          priority: this.defaultTaskPriority,
          created: Date.now(),
          completed: false,
        });
        this.$nextTick(function () {
          new timeago().render(document.querySelectorAll(".timeago"));
        });
        this.newTask = "";
        this.setData("todoData", this.tasks);
      } else {
        this.newTask = "";
      }
    },
    isComplete: function (task) {
      return task.completed;
    },
    notComplete: function (task) {
      return !this.isComplete(task);
    },
    clearCompleted: function () {
      this.tasks = this.tasks.filter(this.notComplete);
      this.setData("todoData", this.tasks);
    },
    setData: function (key, data) {
      var todoData = JSON.stringify(data);
      localStorage.setItem(key, todoData);
    },
    getData: function (key) {
      var todoData = localStorage.getItem(key);
      return JSON.parse(todoData);
    },
    resetApp: function () {
      this.tasks = this.getData("originalData");
      this.initApp();
    },
    initApp: function () {
      localStorage.clear();
      this.setData("originalData", this.tasks);
      this.sortTasks(this.defaultSortBy, this.defaultSortOrder);
      this.setData("todoData", this.tasks);
      new timeago().render(document.querySelectorAll(".timeago"));
    },
  },
  computed: {
    completedTasks: function () {
      if (this.tasks) {
        return this.tasks.filter(this.isComplete).length;
      }
    },
    remainingTasks: function () {
      if (this.tasks) {
        return this.tasks.filter(this.notComplete).length;
      }
    },
    totalTasks: function () {
      if (this.tasks) {
        return this.tasks.length;
      }
    },
  },
});

var app = new Vue({
  el: "#app",
});
