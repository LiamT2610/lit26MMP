
const executeCodeBtn = document.querySelector('.editor__btn')



//setup ace and tell it which window to read from
let codeEditor = ace.edit("SQLDump");

//intilialises the ace editor, standard code for it
let editorLib = {
    init() {
        //set theme
        codeEditor.setTheme("ace/theme/dracula")

        //set language
        codeEditor.session.setMode("ace/mode/mysql")
    }
}
//check to ensure the amount of pk's are equal to the amount of tables
function PKequal(x) {

    var countPK = (x.match(/primary key/g) || []).length;
    var Tablecount = countTables(x)
    if (countPK !== Tablecount) {
        return false;
    }
    else {
        return true;
    }
}
//counts the amount of tables in the db
function countTables(x) {
    var Tablecount = (x.match(/create table/g) || []).length;
    return Tablecount;
}

//counts the number of fk's in the db
function countFK(x) {
    var FKcount = (x.match(/foreign key/g) || []).length;
    return FKcount;
}
//checks that create statements are only followed by appropriate statements
function createChecker(x) {
    var createPresent = x.includes("create")
    if (createPresent) {
        if (x.includes("create table") || x.includes("create database") || x.includes("create view")) {
            return true;
        } else {
            return false;
        }
    }
}
//global database array of objects
let DB = [{}]

function populateDB(string) {
    //splits the string into attributes
    var attributeSplit = string.split("\n");

    //initialising and filling the DB object array to create a database model

    var i
    //have to make array so it passes by ref and not by val, it was this or make table global
    var table = []

    for (i = 0; i < attributeSplit.length - 1; i++) {
        listAttri(attributeSplit[i], table)
    }


}
//find the length of each table in the databse and displays to the user how many attributes are in each, just a helpful visualisation tool
function findTableLength(NumTables) {

    var currentTable = DB[0].table
    var attriCount
    var tables = DB.map(function (table) {
        return table['table'];
    });
    var i = 0

    //iterates for number of tables in the sql dump
    for (i = 0; i < NumTables; i++) {

        attriCount = countOccurrences(tables, tables.length, currentTable)
        //if statement to ensure code still works if there's only 1 table in the sql dump (would break if there was nothing to iterate to and no checks)
        if (NumTables > 1) { currentTable = DB[attriCount + 1].table }

        document.getElementById("output").innerHTML += "<br> There are " + attriCount + " Attributes in the " + currentTable + " table";
    }

}
//ensures the user has no attribute names utilising restricted words 
function illegalNameTest() {
    var names = DB.map(function (name) {
        return name['attriName'];
    });
    //array of some of the common restricted words, couldnt feasibly put them all in here so have just used the most common.
    var keyWords = ['create', 'add', 'from', 'drop', 'alter', 'and', 'table', 'primary key', 'foreign key', 'insert', 'select', 'from', 'alter', 'distinct', 'update', 'set', 'delete', 'as', 'order by', 'where', 'or', 'not', 'drop column', 'drop database', 'drop table', 'group by', 'in', 'join', 'exists', 'like']
    if (isIn(keyWords, names)) {
        document.getElementById("output").innerHTML += "<br> Your attribute names use some restricted terms, this can cause problems later when writing querys, try chaning the names to something else! (a few examples of what can cause this is having a attribute named add or delete!"
    }
}

//function to test if the users attribute types are all recognised mysql types
function attriTypeTest() {

    var attris = DB.map(function (attri) {
        return attri['attriType'];
    });

    //types contains a list of common mysql datatypes (doesnt include all, but attmempted to include all that are common at this level of work)
    var types = ['char', 'varchar', 'text', 'tinytext', 'blob', 'tinyblob', 'bit', 'int', 'tinyint', 'bool', 'boolean', 'double', 'decimal', 'dec', 'date', 'datetime', 'timestamp', 'time', 'year', 'money', 'smallint']

    if (!containsAll(attris, types)) {
        document.getElementById("output").innerHTML += "<br> One of your datatypes isnt recognised, check your using appropriate MYSql datatypes for your attributes and check for any spelling errors"
    }

}
//isIn tests if a target array contains some of the values of another array
function isIn(array1, array2) {
    const found = array1.some(r => array2.includes(r))
    return found
}

//Contains all checks if a target array contains all the values of an array
function containsAll(array1, array2) {
    const found = array1.every(r => array2.includes(r))
    return found
}
//countOccurrences counts how many times a particular value occures in an array
function countOccurrences(array, n, x) {
    let res = 0;
    for (let i = 0; i < n; i++) {
        if (x == array[i])
            res++;
    }
    return res;
}
//listAttri is fed a single line of the sql dump and uses a switch statement to detect what kind of line it is and handles it appropriatley
function listAttri(attribute, table) {
    var primarykey
    //checks if the attribute is a primary key
    if (attribute.match(/primary key/) != null) { primarykey = true; }
    else { primarykey = false; }

    //splits sql by space for switch statement
    var splitstring = attribute.split(" ");

    switch (splitstring[0]) {
        case "foreign":
            //in future would add something here to handle relationships between tables, was out of scope for this project
            break;
        case "on":
            // same as with foriegn keys this detects for referential actions which is out of this projects scope and wouldnt be used at the level of teaching this tool is aimed at
            break;
        case "create":
            // detects if the line is the create table line and if so assigns the table name 
            table[0] = splitstring[2]
            break;
        default:
            //default assumes anything that gets this far is an attribute and adds it to a temporary object for adding to the DB
            let tempattri = {
                "table": table[0],
                "Pk": primarykey,
                "attriName": splitstring[0].trim(),
                "attriType": splitstring[1]

            };
            //final check to ensure no FK's or empty attributes have slipped through if not adds attribute to the database model
            if (tempattri.attriName != "" && tempattri.attriType != "key") {
                DB.push(tempattri);
            }
    }
}
//main body of code that executes  when button is pressed
executeCodeBtn.addEventListener('click', () => {
    //reset's the output field
    document.getElementById("output").textContent = "";

    //retrieves sql dump from the ace editor and stores it in a const
    const UserCode = codeEditor.getValue().toLowerCase();

    //section below gives user basic information about there sqlDump and was my first step in this project

    //ensures the user has a pk present for each table
    var PKpresent = PKequal(UserCode);

    if (PKpresent) {
        document.getElementById("output").textContent += "All primary keys present\n";
    } else {
        document.getElementById("output").textContent += "Primary key(s) missing";
    }

    //more basic info about the SQL dump
    document.getElementById("output").innerHTML += "<br> There are " + countTables(UserCode) + " tables in your SQL Dump";
    document.getElementById("output").innerHTML += "<br> There are " + countFK(UserCode) + " relationships between tables in your SQL Dump";

    //ensures the user has used CREATE properly and in the appropriate place
    if (!createChecker(UserCode)) {
        document.getElementById("output").innerHTML += "<br> There are Create statements not followed by suitable keywords, all 'CREATE' statements should be followed by: 'TABLE' 'DATABASE' or 'VIEW'."
    }

    //splits the sql dump into tables
    var Tablesplit = UserCode.split(";");

    //loops through each table in the database and populates the internal model 
    var i
    for (i = 0; i < Tablesplit.length - 1; i++) {
        populateDB(Tablesplit[i]);
    }

    //removes empty index that always appears at start of db
    DB.shift();
    //more complex testing methods that have there own functions run down here
    findTableLength(countTables(UserCode));
    illegalNameTest();
    attriTypeTest();
    //prints out the full db to the console for anyone that wants to look (orignally for debugging but felt it would be nice for anyone that wants a look at the full table)
    console.table(DB);




});
//instialises ace editor
editorLib.init()