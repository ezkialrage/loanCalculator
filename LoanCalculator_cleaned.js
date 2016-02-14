google.load('visualization', '1.0', {
    'packages': ['corechart']
});
/* initial gloabal variables set to default nil*/
var loanMonth = [];
var loanYear = [];
var loanBalance = [];
var graphCounter = 0;
var loanRows = [];
/* document ready */
window.onload = function() {
    /* this is the function handling your scroll to top button on the bottom right */
    var bodyScroll = document.body;
    window.addEventListener("scroll", scrollToTop);

    function scrollToTop() {
            if (bodyScroll.scrollTop < 200) {
                document.getElementById('scrollToTop').classList.add("hide");
            } else {
                document.getElementById('scrollToTop').classList.remove(
                    "hide");
            }
        }
        /* smooth scroll */
    var em = Number(getComputedStyle(document.body, "").fontSize.match(
        /(\d*(\.\d*)?)px/)[1]);
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;
        var $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top - (4 * em)
        }, 900, 'swing');
    });
    /* take the border off of the first link in the menu */
    document.getElementById('menu').getElementsByTagName('a')[0].style.border =
        'none';
    /*  these variables i have predesigned to be reusable and are defined here to be appended in a loop with replaceable keywords*/
    var tabRow =
        '<div class="monthRow"><span class="fLeft">%DATE%</span> <span class="fRight">%AMOUNT%</span></div>';
    var outputRow =
        '<div class="outputRow" class="fLeft"><p>%TEXT%</p><input type="text" class="fRight outputNumber" id="%DATA%"></div>';
    var outputRowTitle =
        '<div class="outputRow title" class="fLeft">%TEXT%</div>';
    var faqInsert =
        '<div class=faqQuestion>Q: %question%</div><div class=faqAnswer>A: %answer% </div>';
    /*  run executeVariables when the submitbutton is clicked */
    document.getElementById("submitButton").addEventListener("click",
        executeVariables);
    /*  run the menu function when menuButton is clicked */
    document.getElementById("menuButton").addEventListener("click", menu);
    /*  for each link in the menu, when its clicked run the menu function */
    var menuClick = document.getElementById('menu').getElementsByTagName(
        'a');
    for (i = 0; i < menuClick.length; i++) {
        menuClick[i].addEventListener("click", menu);
    }
    /*  initial loan variables set to 0 */
    var initialLoan = 0;
    var remainingLoan = 0;
    var interest = 0;
    var monthlyPayment = 0;
    /*  hides the menu when the user clicks out of the box, this is mainly for mobile*/
    var listener = function(event) {
        var box = document.getElementById("menu");
        if ((event.target != box) && (event.target.parentNode != box)) {
            box.className = 'hide';
            document.getElementById('container').removeEventListener(
                'mouseup', listener);
        }
        document.getElementById('container').removeEventListener(
            'mouseup', listener);
    };
    /*  the menu function, shows or hides the menu based on the classname of the menu when the button was pressed. if the
class switches to dontHide, add a listener to close the menu if user clicks outside of menu*/
    function menu(event) {
            var menuState = document.getElementById("menu");
            if (menuState.className == "hide") {
                menuState.className = "dontHide";
                document.getElementById('container').addEventListener(
                    'mouseup', listener);
            } else {
                window.removeEventListener('mouseup', listener);
                menuState.className = "hide";
            }
        }
        /*  changes the variables from the default zero, to the numbers that the unser inputs into the webpage, and then makes sure they
are integers by parsInt'ing them. if the user does not enter numbers, return error message*/

    function executeVariables(event) {
            event.preventDefault()
            remainingLoan = parseFloat(document.getElementById(
                "currentLoanAmount").value);
            interest = parseFloat(document.getElementById("interestRate").value);
            monthlyPayment = parseFloat(document.getElementById(
                "monthlyPaymentAmount").value);
            if (isNaN(remainingLoan) || isNaN(interest) || isNaN(
                monthlyPayment)) {
                alert("You can only enter numbers for this tool");
                return;
            }
            /*  this next code removes all of the children in monthinfo everytime this function is called.  that way when you run the
        program multiple times, you dont get stacking results. */
            var monthTabs = document.getElementById('monthInfo');
            while (monthTabs.firstChild) {
                monthTabs.removeChild(monthTabs.firstChild);
            }
            var monthRows = document.getElementById('outputInfo');
            while (monthRows.firstChild) {
                monthRows.removeChild(monthRows.firstChild);
            }
            /*  this starts the loading function when the user clicks the submit button*/
            startLoad();
        }
        /*  grey the screen, show the loader, and run the calculator*/

    function startLoad() {
            document.getElementsByTagName("html")[0].className = "loading";
            setTimeout(function() {
                /*  call the loancalculator function, with the variables we've definec in the executevariables function, but only
            after a short timeout perioud of 1000ms to let the loading function spin for a bit*/
                loanCalculator(remainingLoan, interest,
                    monthlyPayment);
            }, 1000);
        }
        /*  here's the meat and potatoes calculator.  */

    function loanCalculator(remainingLoan, interest, monthlyPayment) {
            /*  clear out the loanRows array everytime the function is called so you dont get stacking graphs*/
            loanRows = [];
            /*  enjoy your stay*/
            console.log("Welcome to The Loan Repayment Plan");
            /*  Here are most of the variables that we need to make this calculator work.  this is the math. .toFixed(x) returns a value with
    x amount of digits after the decimal BUT IT RETURNS A STRING, YOU MUST parseFloat() THE WHOLE THING TO RETURN A NUMBER*/
            var interestDecimal = parseFloat((interest / 100).toFixed(4));
            var yearInterest = remainingLoan * interestDecimal;
            var monthInterest = (Math.pow(1 + interestDecimal, 1 / 12) - 1) *
                remainingLoan;
            var dailyInterest = remainingLoan * (Math.pow(1 +
                interestDecimal, 1 / 365) - 1);
            var loan = parseFloat(remainingLoan.toFixed(2));
            var payToDate = 0;
            var payment = monthlyPayment;
            var yearPayment = payment * 12;
            var monthCount = 0;
            var yearCount = 0;
            var totalInterestPaid = 0;
            var monthNames = ["January", "February", "March", "April",
                "May", "June", "July", "August", "September", "October",
                "November", "December"
            ];
            var month = Math.round(loan / payment);
            var payOffDate = new Date();
            var tempCount = 0;
            var i = 0;
            /*  While your initial loan is greater than zero, run the calculator. */
            while (loan > 0) {
                var tempLoan = loan - payment;
                var tempInterest = loan * (interestDecimal / 12);
                var loopCount = tempCount;
                var row = document.getElementById("monthInfo");
                /*  if your loan is less than what your original loan + interest will be, you are not making progress on your loan, return error*/
                if (loan < (tempLoan + tempInterest) || (monthlyPayment ==
                    monthInterest)) {
                    alert("you must pay at least $" + parseFloat((
                            monthInterest + 5).toFixed(2)) +
                        " to start making a dent");
                    document.getElementsByTagName("html")[0].classList.remove(
                        "loading");
                    return;
                }
                /*  if your temporary loan is still greater than zero, push content into the loanRows array for the graph. */
                if (tempLoan > 0) {
                    loan = tempLoan + tempInterest;
                    payToDate = payToDate + payment;
                    monthCount = monthCount + 1;
                    totalInterestPaid += tempInterest;
                    /*  calculates how many years */
                    yearCount = Math.floor(monthCount / 12);
                    if ((loopCount + payOffDate.getMonth()) > 11) {
                        tempCount = tempCount - 12;
                        loopCount = tempCount;
                    }
                    loanRows.push([monthNames[payOffDate.getMonth() +
                        loopCount] + " " + (payOffDate.getFullYear() +
                        yearCount).toString(), parseInt(loan)]);
                    tempCount++;
                    /*  appends date and loan ammount rows into the month by month loan breakdown div*/
                    row.innerHTML = row.innerHTML + tabRow.replace("%DATE%",
                        monthNames[payOffDate.getMonth() + loopCount] +
                        " " + (payOffDate.getFullYear() + yearCount).toString()
                    ).replace("%AMOUNT%", '$' + parseFloat(loan.toFixed(
                        2)));
                    /*  alternates the month by month row color */
                    if (i == 0) {
                        document.getElementById("monthInfo").lastChild.className =
                            "monthRow grey";
                        i = 1;
                    } else if (i != 0) {
                        document.getElementById("monthInfo").lastChild.className =
                            "monthRow";
                        i = 0;
                    }
                }
                /*  if your loan ever goes into negative values, stop the calculator*/
                else {
                    break;
                }
            }
            /*  this function runs to get a number between 0 and 11 to correlate between january -december, this will tell you what month
     your loan will finish*/
            if (monthCount >= 12) {
                monthCount = (monthCount % 12);
            }
            /*  this function will tell you the default amount of years you have left */
            if (((payOffDate.getMonth() + (monthCount % 12)) > 10) && (
                yearCount == 0)) {
                yearCount = 1;
            }
            /*  What month you will finish  if the month is grater than 11(december) than subtract 12  and return the absolute value of that number*/
            var payOffMonth = (payOffDate.getMonth() + monthCount);
            if (payOffMonth > 11) {
                payOffMonth = Math.abs((payOffDate.getMonth() + monthCount) -
                    12);
            }
            var compInt = "Your yearly compounded interest rate is about ";
            var compIntTotal = parseFloat(yearInterest.toFixed(2));
            var compMon = "Your compounded monthly interest rate is about ";
            var compMonTotal = parseFloat(monthInterest.toFixed(2));
            var compDay = "Your compounded daily interest rate is about ";
            var compDayTotal = parseFloat(dailyInterest.toFixed(2));
            var payMon = "Paying " + monthlyPayment +
                " monthly you will pay a grand total of ";
            var payMonTotal = parseFloat((payToDate + Math.round(loan)).toFixed(
                2));
            var totInt = "You will pay a total interest amount of about ";
            var totIntTotal = parseFloat(totalInterestPaid.toFixed(2));
            var totYear = "It will take you " + yearCount + " years " +
                "& about " + monthCount + " months to pay off at this rate";
            var estDate = "Your estimated pay off date is " + (monthNames[
                payOffMonth]) + " " + (payOffDate.getFullYear() +
                yearCount);
            var endStat = totYear + ' <br /> <br />' + estDate;
            var scrollDownForInfo = '<br />' +
                ' Scroll down for more information'
                /*  this array holds all of your calculated loan statistics  */
            var numberHolder = [];
            /*  this object holds your calculated loan statistics along with some copy to go with it */
            var infoHolder = {
                compoundInterestId: {
                    'text': compInt,
                    'number': "$" + compIntTotal
                },
                compoundMonthId: {
                    'text': compMon,
                    'number': "$" + compMonTotal
                },
                compoundDayId: {
                    'text': compDay,
                    'number': "$" + compDayTotal
                },
                payingMonthlyId: {
                    'text': payMon,
                    'number': "$" + payMonTotal
                },
                totalInterestId: {
                    'text': totInt,
                    'number': "$" + totIntTotal
                }
            };
            /*  for every object in infoHolder, add an outputRow div and replace the keywords with the object text and give the div the ID of the object name,
        push the number data to the number holder array*/
            for (var info in infoHolder) {
                document.getElementById("outputInfo").innerHTML = document.getElementById(
                    "outputInfo").innerHTML + outputRow.replace(
                    '%TEXT%', infoHolder[info].text).replace('%DATA%',
                    info);
                numberHolder.push(infoHolder[info].number);
            }
            /*  add the remaining text */
            document.getElementById("outputInfo").innerHTML = document.getElementById(
                "outputInfo").innerHTML + outputRowTitle.replace(
                '%TEXT%', endStat);
            document.getElementById("estimatedDate").innerHTML = estDate +
                scrollDownForInfo;
            /*   eLength = number of divs we created with the class output number */
            var eLength = document.getElementsByClassName('outputNumber');
            /*  for each div we created, give the value of that div, the value of that same number in the number holder array, which contains our statistics*/
            for (var t = 0; t < eLength.length; t++) {
                document.getElementsByClassName('outputNumber')[t].value =
                    numberHolder[t];
            }
            /*  this will get the number of halfcontent divs, and  remove the class dNone, which hides the divs.  this way, the divs with your information will
        show up when the user clicks the submit button*/
            var halfContent = document.getElementsByClassName("halfContent");
            var hC = halfContent.length;
            for (var h = 0; h < hC; h++) {
                halfContent[h].classList.remove('dNone');
                menuClick[h].classList.remove('dNone');
            }
            /*  call the google chart*/
            drawChart();
            /* remove the loading screen */
            document.getElementsByTagName("html")[0].classList.remove(
                'loading');
        }
        /*  end of loan calculator */
        /*  this object contains all of the FAQ's that will appear on the page.  you can add your question and answer here and
they will auto populate on the page*/
    var faqRows = {
        question1: {
            'question': "What is The Loan Repayment Plan?",
            'answer': "TLRP is a tool for anyone with a student loan, mortgage, or any interest based debt to use and quickly gather facts about how long it will take them to pay it off. This information is great because it will tell you, as simple as possible, easy to understand information such as how much interest your loan accrues per year/month/day and will predict your estimated loan payoff month. "
        },
        question2: {
            'question': "I have multiple (student)loans with varying interest rates. What do I do?",
            'answer': "Well, as of 1.0 we only account for a single loan with a single interest rate.  The very next update, 1.1, will include options for multiple loans with varying interest rates, so be assured this is coming.  "
        },
        question3: {
            'question': "How is the repayment prediction calculated?",
            'answer': 'The prediction is calculated on a monthly basis with interest compounding on a monthly basis.  The next step in TLRP evolution is to add options for bi-weekly payment, as well as  "Even payments" vs "Waterfall payments" which is the best method for paying off student loans as quickly as possible.'
        }
    };
    /*  function to add FAQs*/
    var fRCounter = 0;
    for (var faqObj in faqRows) {
        fRCounter++;
        document.getElementById("faq").innerHTML = document.getElementById(
            "faq").innerHTML + faqInsert.replace('%question%', faqRows[
            faqObj].question).replace('%answer%', faqRows[faqObj].answer);
    }
    /*  remove the border on the last FAQ*/
    document.getElementsByClassName('faqAnswer')[fRCounter - 1].classList.add(
        'noBorder');
    /* end of document ready below*/
};
/* end of document ready above*/
/* function to draw the google chart*/
function drawChart() {
        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Month + Year');
        data.addColumn('number', 'Loan Balance');
        data.addRows(loanRows);
        // Set chart options
        var options = {
            'title': 'Loan Balance by Month'
        };
        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.LineChart(document.getElementById(
            'graphLoan'));
        chart.draw(data, options);

        function resizeCharts() {
            // redraw charts, dashboards, etc here
            chart.draw(data, options);
        }
        if (window.addEventListener) {
            window.addEventListener('resize', resizeCharts);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', resizeCharts);
        } else {
            window.onresize = resizeCharts;
        }
    }
    /* v1.01 fixed all toFixed()strings to parseFloat() decimals) */
