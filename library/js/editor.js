
const executeCodeBtn = document.querySelector('.editor__btn')

//setup ace
let codeEditor = ace.edit("SQLDump");

let editorLib = {
    init() {
        //set theme
        codeEditor.setTheme("ace/theme/dracula")

        //set language
        codeEditor.session.setMode("ace/mode/mysql")
    }
}

function PKequal(x){

    var countPK = (x.match(/primary key/g) || []).length;
    var Tablecount = countTables(x)
    if(countPK !== Tablecount){
        return false;
    }
    else{
        return true;
    }
}

function countTables(x){
    var Tablecount = (x.match(/create table/g) || []).length;
        return Tablecount;
      }

function countFK(x){
    var FKcount = (x.match(/foreign key/g) || []).length;
        return FKcount;
    }

function createChecker(x){
    var createPresent = x.includes("create")
    if(createPresent){
        if(x.includes("create table") || x.includes("create database") || x.includes("create vi ew")){
            return true;
        }else{
            return false;
        }
    }
}


//* class structure */

class Table{
    constructor(){
        
    }

}

class Attribute{

    constructor(string, name, attribute, primarykey, table){

         if(string.match(/primary key/ != null)){primarykey = true;}
         else{primarykey = false;}
         
         var Splitstring = string.split(" ");
         if(splitstring[0] == "foreign"){
            //add later
         }else if(splitstring[0] == "on"){
             //add later
        } else{
           name = splitstring[0];
        attribute = splitstring[1];
        }
         this.table = table;
    }
}

function populateDB(string){
    
    var attributeSplit = string.split("\n");
    let attributes = [{}]

    var i 
    for (i = 0; i < attributeSplit.length; i++) { 
        listAttri(attributeSplit[i], attributes)
    }
    console.table(attributes);
}
function listAttri(attribute, attributes){
    var primarykey
    var name
    var type

    if(attribute.match(/primary key/) != null){primarykey = true;}
    else{primarykey = false;}

    var splitstring = attribute.split(" ");
 
    switch(splitstring[0]) {
        case "foreign":
          // code block
          break;
        case "on":
          // code block
          break;
        case "create":
          
            break;
        case ")":
           
            break;
        default:
            let tempattri = {
                "Pk": primarykey,
                "attriName": splitstring[0],
                "attriType" : splitstring[1]
        
            };
            attributes.push(tempattri);
      }



    
}

executeCodeBtn.addEventListener('click', () => {

    document.getElementById("output").textContent = "";
    const UserCode = codeEditor.getValue().toLowerCase();

    var PKpresent = PKequal(UserCode);
    
         if (PKpresent) {
             document.getElementById("output").textContent += "All primary keys present\n";
         }else{
            document.getElementById("output").textContent += "Primary key(s) missing";
         } 

     document.getElementById("output").innerHTML += "<br> There are " + countTables(UserCode) + " tables in your SQL Dump";
     document.getElementById("output").innerHTML += "<br> There are " + countFK(UserCode) + " relationships between tables in your SQL Dump";

     if(!createChecker(UserCode)){
        document.getElementById("output").innerHTML += "<br> There are Create statements not followed by suitable keywords, all 'CREATE' statements should be followed by: 'TABLE' 'DATABASE' or 'VIEW'."
     }

     var DB = UserCode.split(";");

     var i
     for (i = 0; i < DB.length; i++) { populateDB(DB[i]);}
    

});
editorLib.init()