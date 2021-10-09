// BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        })
        data.totals[type] = sum;
        /*
        100 200 300 400
        sum = 0;
        sum = 0 + 100 = 100;
        sum = 100 + 200 = 300;
        sum = 300 + 400 = 700;        
        */
        
    }
    
    return{
        addItem: function(type,des,val){
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
            
             
        },
        
        calculateBudget: function(){
            
            // 1. Calculate total income and total expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            // 2. Calculate total budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. Calculate the percentage of incomes we spent
            if(data.budget > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);                
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);                
            }else{
                data.percentage = -1;
            }
            
            
        },
        
        calculatePercentages: function(){
            /*
            a=20;
            b=40;
            c=40;
            totalIncome = 100;
            10/100 = 10%;
            40/100 = 40%;
            */
            
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            })
            
            
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        deleteItem : function(type,id){
            var ids,index;
            // id = 6
            // ids =[1 2 4 6 8]
            // index = 3
            // data.allitems[type][id]
            
            ids = data.allItems[type].map(function(current){
               return current.id; 
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        
        testing: function(){
            console.log(data);
        }
 
        
        
    }
    
 
})();
 
// UI CONTROLLER

var UIController = (function(){
    
    var DOMstrings ={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
        
    }
    var formatNumber = function(num,type){
            var numSplit,int,dec,num;
            /*
            + or - before the number
            exactly 2 decimal places
            commas seperating the thousands
            */
            
            num = Math.abs(num);// return the absolute value of the number
            num = num.toFixed(2);// for decimal places tofixed() method
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            
            if(int.length > 3){
                //int = int.substr(0,1) + ',' + int.substr(1,3); // input 2310 output 2,310
                //int = int.substr(0,2) + ',' + int.substr(2,3); // input 22310 output 22,310
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
            }
            
            dec = numSplit[1];
            
            return (type === 'exp'? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
            
        }
    
    return {
        getInput : function(){
            return{
            type : document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            }
            
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        },
        
        addListItem: function(obj,type){
            
            var html,newHtml,element;
            // Create HTML String with placeholder text
            if(type === 'inc'){
                
                element = DOMstrings.incomeContainer;
                
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                
                element = DOMstrings.expensesContainer;
                
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div>   </div></div>';
            }
            
            // Replace the placeholder text with some actual data
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            // Insert the HTML into DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            
            var fields,fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            
            fields[0].focus();
                              
                              
        },
        
        displayBudget: function(obj){
            
            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';                
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            var nodeListForEach = function(list,callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i] , i);                    
                }
                
            }
            
            nodeListForEach(fields, function(current,index){
                
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';                    
                }else{
                    current.textContent = '---';
                }        
                
                
                
            });
        },
        
        displayMonth: function(){
            
            var now,year,month,months;
            
            now = new Date();
            
            year = now.getFullYear();
            month = now.getMonth();
            var months =['January','February','March','April','May','June','July','August','September','October','November','December'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            var nodeListForEach = function(list,callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i] , i);                    
                }
                
            }
            
            nodeListForEach(fields,function(current){
                current.classList.toggle('red-focus');
            })
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
        

    }
})();

// GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl,UICtrl){
    
    var setupEventListeners = function(){
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
        
        if(event.keycode === 13 || event.which === 13){
            ctrlAddItem();
        }
    })
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
}
    
    var DOM = UICtrl.getDOMstrings();
    
    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget to the UI
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages = function(){
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Display the percentages to the UI
        UICtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function(){
        var input,newItem;
        // 1. Get the field input data
        
        input = UICtrl.getInput();
        //console.log(input);
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        
        // 3. Add the item to the UI
        UICtrl.addListItem(newItem,input.type);
        
        // 4. Clear the input fields
        UICtrl.clearFields();
        
        // 5. Calculate and update the budget
        updateBudget();
        
        // 6. Calculate and update the percentages
        updatePercentages();    
                    
        }
                        
    }
    
    var ctrlDeleteItem = function(event){
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from our data structure
            budgetCtrl.deleteItem(type,ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Recalculate and update the budget
            updateBudget();
        }
    }
    
    return{
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth(); 
            UICtrl.displayBudget({ 
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
        
})(budgetController,UIController);

controller.init();



















