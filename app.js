const express=require("express");
const app=express();
app.use(express.json());
const {open}=require("sqlite");
const sqlite3=require("sqlite3");
const path=require("path");
const dbPath=path.join(__dirname,"todoApplication.db");
const format=require("date-fns/format");
const isMatch=require("date-fns/isMatch");
var isValid=require("date-fns/isValid");

let db=null;

const intializeDBAndServer=async()=>{
    try {
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(3000,()=>{
            console.log("Server running at http://localhost:3000");
        })
    }
    catch(e){
        console.log("DB Error at ${error}");
        process.exit(1);
    }
}
intializeDBAndServer();

const hasPriorityAndStatus=(requestQuery)=>{
    return (requestQuery.priority!==undefined && requestQuery.status!==undefined);
}
const hasPriority=(requestQuery)=>{
    return (requestQuery.priority!==undefined);
}
const hasStatus=(requestQuery)=>{
    return (requestQuery.status!==undefined);
}
const hasCategory=(requestQuery)=>{
    return (requestQuery.category!==undefined);
}
const hasCategoryAndStatus=(requestQuery)=>{
    return (requestQuery.category!==undefined && requestQuery.status!==undefined);
}
const hasCategoryAndPriority(requestQuery)=>{
    return (requestQuery.category!==undefined && requestQuery.priority!==undefined)
}
const hasSearchProp=(requestQuery)=>{
    return (requestQuery.search_q!==undefined);
}

const outputRes=(objectItem){
    return {
        id:objectItem.id,
        todo:objectItem.todo,
        category:objectItem.category,
        priority:objectItem.priority,
        status:objectItem.status,
        dueDate:objectItem.due_date,
    }
}

app.get("/todos/",async(request,response)=>{
    let data=null;
    let getTodosQuery="";
    const {search_q="",priority,status,category}=request.query;
    switch(true){
        case hasPriorityAndStatus(request.query):
        if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
            if (status==="TO DO" || status==="IN PROGRESS" || status==="DONE"){
                getTodosQuery=`SELECT * FROM todo WHERE status='${status}' and priority='${priority}';`;
                data=await db.all(getTodosQuery);
                response.send(data.map((eachItem)=>outputRes(eachItem)));
            }
            else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        }
        else {
            response.status(400);
            response.send("Invalid Todo Priority");
        }
        break;
        case hasCategoryAndStatus(request.query):
        if (category==="WORK" || category==="HOME" || category==="LEARNING"){
            if (status==="TO DO" || status==="IN PROGRESS" || status==="DONE"){
                getTodosQuery=`SELECT * FROM todo WHERE category='${category}' and status='${status}';`;
                data=await db.all(getTodosQuery);
                response.send(data.map((eachItem)=>outputRes(eachItem)));
            }else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        }
        else {
            response.status(400);
            response.send("Invalid Todo Category");
        }
        break;
        case hasCategoryAndPriority(request.query):
        if (category==="WOEK" || category==="HOME" || category==="LEARNING"){
            if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
                getTodosQuery=`SELECT * FROM todo WHERE category='${category}' and priority='${priority}';`;
                data=await db.all(getTodosQuery);
                response.send(data.map((eachItem)=>outputRes(eachItem)));
            }
            else{
                response.status(400);
                response.send("Invalid Todo Priority");
            }
        }
        else {
            response.status(400);
            response.send("Invalid Todo Category");
        }
        break;
        case hasPriority(request.query):
        if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
            getTodosQuery=`SELECT * FROM todo WHERE priority='${priority}';`;
            data=await db.all(getTodosQuery);
            response.send(data.map((eachItem)=>outputRes(eachItem)));
        }
        else {
            response.status(400);
            response.send("Invalid Todo Priority");
        }
        break;
        case hasStatus(request.query):
        if (status==="TO DO" || status==="IN PROGRESS" || status==="DONE"){
            getTodosQuery=`SELECT * FROM todo WHERE status='${status}';`;
            data=await db.all(getTodosQuery);
            response.send(data.map((eachItem)=>outputRes(eachItem)));
        }
        else {
            response.status(400);
            response.send("Invalid Todo Status");
        }
        break;
        case hasCategory(request.query):
        if (category==="WORK" || category==="HOME" || category==="LEARNING"){
            getTodosQuery=`SELECT * FROM todo WHERE category='${category}';`
            data=await db.all(getTodosQuery);
            response.send(data.map((eachItem)=>outputRes(eachItem)));
        }
        else{
            response.status(400);
            response.send("Invalid Todo Category");
        }
        break;
        case hasSearchProp(request.query):
          getTodosQuery=`SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
          data=await db.all(getTodosQuery);
          response.send(data.map((eachItem)=>outputRes(eachItem)));
          break;
          default:
          getTodosQuery=`SELECT * FROM todo;`;
          data=await db.all(getTodosQuery);
          response.send(data.map((eachItem)=>outputRes(eachItem)));
    }

});


app.get("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    getTodosQuery=`SELECT * FROM todo WHERE id=${todoId};`;
    data=await db.get(getTodosQuery);
    response.send(outputRes(data));
})

app.get("/agenda/",async(request,response)=>{
    const {date}=request.query;
    console.log(isMatch(date,"yyyy-MM-dd"));
    if (isMatch(date,"yyyy-MM-dd")){
        const newDate=format(new Date(date),"yyyy-MM-dd");
        console.log(newDate);
        const requestQuery=`SELECT * FROM todo WHERE due_date='${dueDate}';`;
        const responseRes=await.db.all(requestQuery);
        reponse.send(responseRes.map((eachItem)=>outputRes(eachItem)));
    }
    else {
        response.status(400);
        response.send("Invalid Todo Due Date");
    }
    
});


app.post("/todos/",async(request,response)=>{
    const {id,todo,priority,status,category,dueDate}=request.body;
    if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
        if (status==="TO DO" || status==="IN PROGRESS" || status==="DONE"){
            if (category==="WORK" || category==="HOME" || category==="LEARNING"){
                if (isMatch(dueDate,"yyyy-MM-dd")){
                    const postNewDueDate=format(new Date(dueDate), "yyyy-MM-dd");
                    const postTodoQuery=`INSERT INTO todo(id,todo,priority,status,category,due_date)
                    VALUES(${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
                    await db.run(postTodoQuery);
                    response.send("Todo Successfully Added");
                }
                else{
                    response.status(400);
                    response.send("Invalid Due Date");
                }
            }else {
                response.status(400);
                response.send("Invalid Todo Category");
            }
        }
        else {
            response.status(400);
            response.send("Invalid Todo Status");
        }
    }
    else {
        response.status(400);
        response.send("Invalid Todo Priority");
    }
})

app.put("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    let updatedColumn="";
    const requestBody=request.body;
    const previousTodoQuery=`SELECT * FROM todo WHERE id=${todoId};`;
    const previousTodo=await db.get(previousTodoQuery);
    const {
        todo=previousTodo.todo,
        priority=previousTodo.priority,
        status=previousTodo.status,
        category=previousTodo.category,
        dueDate=previousTodo.dueDate,
    }=request.body;
    let updateTodoQuery;
    switch (true){
        case (requestBody.status!==undefined):
          if (status==="TO DO" || status==="IN PROGRESS" || status==="DONE"){
            updateTodoQuery=`UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', categor'${category}', due_date='${dueDate}' WHERE id=${todoId};`;
            await db.run(updateTodoQuery);
            response.send("Status Updated")
          }
          else {
            response.status(400);
            response.send("Invalid Todo Status");
          }
          break;
          case (requestBody.priority!==undefined):
            if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
                updateTodoQuery=`UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', categor'${category}', due_date='${dueDate}' WHERE id=${todoId};`;
                await db.run(updateTodoQuery);
                response.send("Priority Updated");
            }
            else {
                response.status(400);
                response.send("Invalid Todo Priority");
            }
            break;
            case (requestBody.todo!==undefined):
                updateTodoQuery=`UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', categor'${category}', due_date='${dueDate}' WHERE id=${todoId};`;
                await db.run(updateTodoQuery);
                response.send("Todo Updated");
            }
            break;
            case (requestBody.category!==undefined):
               if (category==="WORK" || category==="HOME" || category==="LEARNING") {
                   updateTodoQuery=`UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', categor'${category}', due_date='${dueDate}' WHERE id=${todoId};`;
                   await db.run(updateTodoQuery);
                   response.send("Category Updated");
            }
            else {
                response.status(400);
                response.send("Invalid Todo Category");
            }
            break;
            case (requestBody.dueDate!==undefined):
              if (isMatch(dueDate,"yyyy-MM-dd")){
                const newDueDate=format(new Date(dueDate), "yyyy-MM-dd");
                updateTodoQuery=`UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', categor'${category}', due_date='${newDueDate}' WHERE id=${todoId};`;
                await db.run(updateTodoQuery);
                response.send("Due Date Updated");
              }else {
                response.status(400);
                response.send("Invalid Due Date");
              }
              break;
    }
});

app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const deleteQuery=`DELETE FROM todo WHERE id=${todoId};`;
    await db.run(deleteQuery);
    response.send("Todo Deleted")
});

module.exports=app;
