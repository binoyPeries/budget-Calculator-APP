//creating module pattern
// budget controller
var budgetControl = (function(){

    var Expense = function(id, decs,value){
        this.id = id;
        this.decs = decs;
        this.value=value;

    };

    var Income = function(id, decs,value){
        this.id = id;
        this.decs = decs;
        this.value=value;
        this.percentage=-1;

    };

    Expense.prototype.calcper = function(totalincome){
        if(totalincome>0){
            this.percentage = Math.round( this.value/totalincome*100);
        }
        

    };

    Expense.prototype.getPer =function(){
        return this.percentage;
    };
   

    var data = {
        allitem: { 
            exp: [],
            inc: []
        },

        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage: -1


    };

    var caltotal = function(type){
        var sum=0;
        data.allitem[type].forEach(function(current){
            sum+= current.value;

        });
        data.totals[type] = sum;

    }

    return{
        addItem: function(type, des , val){
            var newItem,ID;


            //generate unique id
            if(data.allitem[type].length >0){
                ID = data.allitem[type][data.allitem[type].length-1].id+1;

            }
            else{
                ID =0;
            }
            
            //add item to exp or inc 
            if(type === 'exp'){
                 newItem = new Expense(ID,des,val);
            }

            else if (type=== 'inc'){
                newItem = new Income(ID,des,val);
            }

            //push the item into data structure
            data.allitem[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type , id){
            var ids = data.allitem[type].map(function(current){
                return current.id;

            });
            index = ids.indexOf(id);
            //console.log(index);
            if(index !== -1){
                data.allitem[type].splice(index,1);

            }

        },
        //just to check the functionality
        test: function(){
            console.log(data);
        },

        calBudget : function(){
            caltotal('exp');
            caltotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);

            }
           
        },

        calper: function(){
            data.allitem['exp'].forEach(function(current){
                current.calcper(data.totals.inc);

            });
        },

        getperval: function(){
            var allper = data.allitem.exp.map(function(current){
                return current.getPer();
            });
            
            return allper;
        },

        getbudget: function(){
            return{
                budget: data.budget,
                totalIn: data.totals.inc,
                totalexp: data.totals.exp,
                percentage: data.percentage
            };
        }

    };
   


})();




//ui controller
var UIcontrol = (function(){
    //to store all the class names we require
    var DOMstring ={
        inputType: '.add__type',
        inputdesc: '.add__description',
        inputvalue: '.add__value',
        inputbtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budval: '.budget__value',
        budincome: '.budget__income--value',
        budexp: '.budget__expenses--value',
        expper: '.budget__expenses--percentage',
        container: '.container',
        itemper :'.item__percentage',
        date:'.budget__title--month'
    };

    var formatNum = function(num,type){
        //+ 0r - before number
        //, to sparte num
        //2 decimal points

        num = Math.abs(num);
        num = num.toFixed(2); // to roundup to floating points

        var intpart = num.split('.')[0]; //to get the int part
        
        var temp ='0'
        if(intpart.length >3){
            var amount = parseInt(intpart.length)%3;
            console.log(amount);
        
            temp='';
            switch(amount){
            
                case 0:
                    for ( var i =0 ; i < intpart.length;i+=3){
                        temp += intpart.substr(i,3);
                        if(i+3  !== intpart.length){
                            temp +=',';
                        }
                    }
                    break;
                case 1:
                    temp += intpart.substr(0,1)+',';
                    for ( var i =1 ; i < intpart.length;i+=3){
                        temp += intpart.substr(i,3);
                        if(i+3  !== intpart.length){
                            temp +=',';
                        }
                    }
                    break;

                case 2:
                    temp += intpart.substr(0,2)+',';
                    for ( var i =2 ; i < intpart.length;i+=3){
                        temp += intpart.substr(i,3);
                        if(i+3  !== intpart.length){
                            temp +=',';
                        }
                    }
                    break;

            }
            intpart = temp;

        }


        type === 'exp'? sign ='-' : sign ='+';

        return sign+' '+ intpart+'.'+num.split('.')[1];

    };

    var nodeListForEach = function(list, callback){
        for(var i=0 ; i <list.length ; i++){
            callback(list[i],i);
        }
    };

  



    return{
        //1
         getInput: function(){
            return{
                 type: document.querySelector(DOMstring.inputType).value,  //values = inc or exp
                 decp: document.querySelector(DOMstring.inputdesc).value,
                 //parsefloat make the value a number 
                 val: parseFloat(document.querySelector(DOMstring.inputvalue).value)
   
            };           
        },
        //2
        getDOMString: function(){
            return DOMstring;

        },

        addListItem: function(obj ,type){
            //create html strings with placeholder
            var html,newhtml,element;
            if(type === 'inc'){
                element = DOMstring.incomeContainer;
                html =' <div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            else if( type === 'exp'){
                element = DOMstring.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            

            //replace placeholder with data
            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%', obj.decs);
            newhtml = newhtml.replace('%value%', formatNum(obj.value, type) );

            //insert html to dOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);

        },
        clearField: function(){
            var fields = document.querySelectorAll(DOMstring.inputdesc + ','+ DOMstring.inputvalue);
            //this is to convert the list thta gets returned from the querySelectorAll to array**
            var fieldsArr = Array.prototype.slice.call(fields);
            

             //loop over an array new method
             //index,array are optional
            fieldsArr.forEach(function(current , index, array){
                //console.log(current);
                current.value ="";
                


            });
            fieldsArr[0].focus();
        } ,
        displayBudget: function(obj,type){
            document.querySelector(DOMstring.budval).textContent = formatNum(obj.budget,type);
            document.querySelector(DOMstring.budincome).textContent = formatNum(obj.totalIn,type);
            document.querySelector(DOMstring.budexp).textContent = formatNum( obj.totalexp, type);
        
            if(obj.percentage>0){
                document.querySelector(DOMstring.expper).textContent = obj.percentage+'%';

            }
            else{
                document.querySelector(DOMstring.expper).textContent ='---';
            }



        },

        deleteListItem: function(selectorID){
            document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));

        },

        displayPer: function(arr){
            var fields = document.querySelectorAll(DOMstring.itemper);

            nodeListForEach(fields, function(current,index){
                if(arr[index]>0){
                    current.textContent = arr[index]+"%";
        
                }
                else{
                    current.textContent = "---";
                }
                
        
            });

            

            
        },

        displayMon: function(){
            var mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','nov','Dec']
            var now = new Date();
            var year = now.getFullYear();
            var mon = now.getMonth();
            document.querySelector(DOMstring.date).textContent = mons[mon]+' '+ year;

        },
        changetype: function(){
            var fields = document.querySelectorAll(
                DOMstring.inputType +','+
                DOMstring.inputdesc +','+
                DOMstring.inputvalue

            );

            nodeListForEach(fields, function( current){
                current.classList.toggle('red-focus')
            });

            document.querySelector(DOMstring.inputbtn).classList.toggle('red');
        }
        


    };
    


})();


//global app cntrl
var control =(function(budgetCtrl, uictrl){

    var setupEvent = function(){

        var DOM = uictrl.getDOMString();

         //both following events have to do the same thing hence the cntrlAddItem function
        document.querySelector(DOM.inputbtn).addEventListener('click',cntrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode ===13){// to specify the enter button
                cntrlAddItem();
            }
         });
        
        document.querySelector(DOM.container).addEventListener('click',cntrldelete);

        document.querySelector(DOM.inputType).addEventListener('change', uictrl.changetype);

    }

    var updateBudget = function(type){
         // cal budget
        budgetCtrl.calBudget();

         //return budget
        var budgetdetail = budgetCtrl.getbudget();
        
       //diaplay budget in ui
        uictrl.displayBudget(budgetdetail ,type );

       //console.log(budgetdetail);

    };

    var updatePer = function(){
        //cal per
        budgetCtrl.calper();

        //read per from budget cntrl
        var percenatge = budgetCtrl.getperval();

        //update ui
        uictrl.displayPer(percenatge);
    }

    

    var cntrlAddItem  = function(){
        var inputs = UIcontrol.getInput();
        if(inputs.decp !== "" && !isNaN(inputs.val) && inputs.val >0){// to avoid empty entries 

            var newItem = budgetCtrl.addItem(inputs.type, inputs.decp , inputs.val);
            uictrl.addListItem(newItem,inputs.type);
            //to clear the fields once the daata is taken
            uictrl.clearField();

            updateBudget(inputs.type);
            //to cal per of each expense
            updatePer();

        }
        
       //console.log(inputs);

        //***todo****
        //hits button get input data 
       //add the item to budget cntrl
       //add to ui
      

   }

    var cntrldelete = function(event){
        //event.target helps us to find the where the click happened
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            //format id inc-0 or exp-0....
            splitId = itemId.split('-');
            var type = splitId[0];
            var id = parseInt(splitId[1]);
            //console.log(id);


            //delete item from data struc
            budgetCtrl.deleteItem(type,id);
            //delete from ui
            uictrl.deleteListItem(itemId)

            //update budget and display
            updateBudget();

            updatePer();

        }
        

    };

   return{
       init: function() {
            uictrl.displayBudget({
                budget: 0,
                totalIn: 0,
                totalexp: 0,
                percentage: -1

            });
           setupEvent();
           uictrl.displayMon();           
       }
      
   };

    
})(budgetControl,UIcontrol);

//outside modules******
control.init();

