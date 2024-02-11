var api_url = "http://localhost:3000";

//после загрузки разметки, стилей и скриптов
document.addEventListener("DOMContentLoaded", async () => {
    const addCategoriesForm = document.querySelector("#addCategoriesForm");

    addCategoriesForm.addEventListener("submit", sendNewCategory);
    console.log('1')
    await loadCategories();
});

//обработчик отправки формы
async function sendNewCategory(event) {
    event.preventDefault();

    const categoryName = document.querySelector("#categoryName").value;    
    const id = document.querySelector("#categoryId").value;
    if (categoryName === "") {
        alert("Пожалуйста, введите название категории");
        return;
    }

    try {
        //id в скрытом поле не меняется при добавлении категории
        if (id == 0) {
            await addCategory(categoryName);
        }
        //при изменении мы получаем данные категории для изменения и записываем их в форму, значение в поле id заполняется данными изменяемого объекта
        else {
            await EditCategory(id, categoryName);
        }
    } catch (error) {
        console.log(`Ошибка при выполнении запроса: ${error}`);
    }
}


function addCategory(categoryNames) {
    const categoryName = categoryNames;
    console.log('-----');
    console.log(categoryName);
    fetch('/admin-goods', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryName: categoryName })
    })
    .then(response => response.json())
    .then(data => {
        displayCategories(data.categories);
    });
}
//загрузка категорий
async function loadCategories() {
    const res = await fetch(`${api_url}/admin-goods`);
    console.log('+******+');
    const categories = await res.json();
    
    console.log(categories);
    let rows = document.querySelector("tbody");
    categories.forEach((category) => rows.append(row(category))); //для каждой категории создаем строку с данными о ней
}

//создание строки таблицы
function row(category) {
    const tr = document.createElement("tr"); //новая строка дл пользователя
    tr.style.verticalAlign = "middle"; //вертикальное выравнивание строки таблицы
    tr.setAttribute("data-rowid", category.id); //атрибут, из которого можно извлечь id пользователя

    //ячейка id
    const idTd = document.createElement("td");
    idTd.append(category.id); //контент ячейки
    tr.append(idTd); //добалвяем ячейку в строку

    //ячейка имени
    const nameTd = document.createElement("td");
    nameTd.style.width = "70%";
    nameTd.append(category.name);
    tr.append(nameTd);

    //ячйка с кнопками действий
    const btnTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.setAttribute("data-id", category.id);
    editBtn.classList.add("btn", "btn-warning", "me-5");
    editBtn.append("Изменить"); //контент кнопки
    //слушатель клика для получения пользователя по id
    editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        GetCategoryById(category.id);
    });
    btnTd.append(editBtn);

    const removeBtn = document.createElement("button");
    removeBtn.setAttribute("data-id", category.id);
    removeBtn.classList.add("btn", "btn-danger", "ms-5");
    removeBtn.append("Удалить");
    removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        DeleteCategory(category.id);
    });
    btnTd.append(removeBtn);

    tr.append(btnTd);

    return tr;
}

function displayCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        categoryList.appendChild(li);
    });
}
