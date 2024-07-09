import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "ToDoList",
  password: "123456",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getAllItems(){
  try{
    const result = await db.query("SELECT * FROM Items ORDER BY id ASC");
    return result.rows;
  } catch(err) {
    console.log(err);
  } 
}

app.get("/", async (req, res) => {
  try{
    const allItems = await getAllItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: allItems,
    });
  } catch(err) {
    console.log(err);
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: [],
    });
  }
  
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  if(item.length != 0)  {
    try{
      const result = await db.query("INSERT INTO Items (name) VALUES ($1)",
      [item]
      );
    } catch(err){
      console.log(err);
    }
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const editText = req.body.updatedItemTitle;
  if(editText.length != 0){
    const postId = req.body.updatedItemId;
    try{
      const result = await db.query("UPDATE Items SET name = $1 WHERE id = $2;",
      [editText, postId]
      );
    } catch(err){
      console.log(err);
    }
  }
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try{
    const result = await db.query("DELETE FROM Items WHERE id = $1", 
      [id]
    );
  } catch(err){
    console.log(err);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
