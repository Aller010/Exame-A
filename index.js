console.clear();

class Task {
    constructor(description, cost) {
        const _id = "id" + Math.random().toString(16).slice(2);
        const _description = description;
        const _cost = cost;

        if (!(this instanceof Task)) {
            throw new Error("You can't call Task without new");
        }

        Object.defineProperty(this, 'id', {
            get: function () {
                return _id;
            }
        });
        Object.defineProperty(this, 'description', {
            get: function () {
                return _description;
            }
        });
        Object.defineProperty(this, 'cost', {
            get: function () {
                return _cost;
            }
        });
    }
}

class IncomeTask extends Task {
    constructor(description, cost) {
        super(description, cost);
    }

    makeDone(budget) {
        budget.income += this.cost;
    }

    makeUnDone(budget) {
        budget.income -= this.cost;
    }
}

class ExpenseTask extends Task {
    constructor(description, cost) {
        super(description, cost);
    }

    makeDone(budget) {
        budget.expenses += this.cost;
    }

    makeUnDone(budget) {
        budget.expenses -= this.cost;
    }
}

class TaskController {
    #tasks;

    constructor() {
        this.#tasks = [];
    }

    addTasks(...tasks) {
        for (const task of tasks) {
            const isUnique = !this.#tasks.some(t => t.id === task.id);
            if (isUnique) {
                this.#tasks.push(task);
            }
        }
    }

    deleteTask(task) {
        this.#tasks = this.#tasks.filter((item) => item.id !== task.id);
    }

    getTasks() {
        return [...this.#tasks];
    }

    getTasksSortedBy(value) {
        let sortFunction;
        switch (value) {
            case "description":
                sortFunction = (a, b) => {
                    if (a.description < b.description) {
                        return -1;
                    }
                    if (a.description > b.description) {
                        return 1;
                    }
                    return 0;
                };
                break;
            case "status":
                sortFunction = (a, b) => {
                    if (a.isCompleted() && !b.isCompleted()) {
                        return -1;
                    }
                    if (!a.isCompleted() && b.isCompleted()) {
                        return 1;
                    }
                    return 0;
                };
                break;
            case "cost":
                sortFunction = (a, b) => {
                    if (a.cost > b.cost) {
                        return -1;
                    }
                    if (a.cost < b.cost) {
                        return 1;
                    }
                    return 0;
                };
                break;
            default:
                return this.#tasks;
        }

        return this.#tasks.sort(sortFunction);
    }

    getFilteredTasks(filter) {
        return this.#tasks.filter(function (task) {
            if (filter.description) {
                if (!task.description.toLowerCase().includes(filter.description.toLowerCase())) {
                    return false;
                }
            }

            if (typeof filter.isIncome === 'boolean') {
                if (filter.isIncome && !(task instanceof IncomeTask)) {
                    return false;
                }
                if (!filter.isIncome && !(task instanceof ExpenseTask)) {
                    return false;
                }
            }

            if (typeof filter.isCompleted === 'boolean') {
                if (filter.isCompleted && !task.isCompleted) {
                    return false;
                }
                if (!filter.isCompleted && task.isCompleted) {
                    return false;
                }
            }

            return true;
        });
    }
}

class BudgetController {
    #taskController;
    #budget;

    constructor(initialBalance = 0) {
        this.#taskController = new TaskController();
        this.#budget = {
            balance: initialBalance,
            income: 10,
            expenses: 5,
        };
    }

    get balance() {
        return this.income - this.expenses;
    }

    get income() {
        return this.#budget.income;
    }

    get expenses() {
        return this.#budget.expenses;
    }

    calculateBalance() {
        return this.#budget.balance + this.#budget.income - this.#budget.expenses;
    }

    getTasks() {
        return this.#taskController.getTasks();
    }

    addTask(...tasks) {
        this.#taskController.addTasks(...tasks);
    }

    deleteTask(task) {
        const tasks = this.#taskController.getTasks();
        if (!tasks.some(t => t.id === task.id)) {
            console.log(`Task ${task.id} isn't recognized`); 
            return;
        }
        this.#taskController.deleteTask(task);
    }

    doneTask(task) {
        const tasks = this.#taskController.getTasks();
        if (!tasks.some(t => t.id === task.id)) {
            console.log(`Task ${task.id} isn't recognized`);
        }

        if (task.completed) {
            console.log("Task is already done");
            return;
        }
        task.completed = true;
        task.completedDate = new Date();
    }

    unDoneTask(task) {
        const tasks = this.#taskController.getTasks();
        const foundTask = tasks.find(t => t.id === task.id);
        if (!foundTask) {
            console.log(`Task ${task.id} isn't recognized`);
            return;
        }

        if (!foundTask.isDone) {
            console.log("Task isn't done before");
            return;
        }

        foundTask.makeUnDone();
    }
}

const budget = new BudgetController();

const task1 = new Task("1", "Task1", 10);
console.log(task1);

task1.makeDone(budget);
console.log(budget.calculateBalance());

task1.makeUnDone(budget);
console.log(budget.calculateBalance());

const task = new Task("2", "Task 2", 15);
budget.addTask(task);

console.log(budget.getTasks());

budget.doneTask(task);
console.log(budget.getTasks());

budget.unDoneTask(task);
console.log(budget.getTasks());