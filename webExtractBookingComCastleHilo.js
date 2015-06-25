/**
 * Created by puneet.mahajan on 15/06/15.
 */
function waitFor(testFx, onReady, onFail, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    typeof(onFail) === "string" ? eval(onFail) : onFail(); //< Do what it's supposed to do once the condition is un-fulfilled
                    clearInterval(interval);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var firsturlplaceholder = 'http://www.xyg.com/hotel/us/castle-hilo-hawaiian.en-gb.html?sid=23dd02e86678081c1558b695bfcd1475;dcid=1;checkin=';
var secondurlplaceholder = ';checkout=';
var thirdurlplaceholder = ';dist=0;group_adults=2;show_room=18062202;srfid=baa7ccf1ac27efd914e1c6618d8d52e6fff23325X1;type=total;ucfs=1&amp;;selected_currency=USD;changed_currency=1#map_closed';
var startDate = new Date();
var iterDate = startDate;
var fs = require('fs');
var hotelNameStr = "";

var fileStr = "PropertyId,Arrival Date,CheckoutDate,SnapshotDate,StandardRoomRate,SuperiorRoomRate,JuniorSuiteWithRefrigeratorRate\n";
var i=0;
var intervalI = setInterval(function() {
    if(i<60) {
        var page = require('webpage').create();
        console.log('The default user agent is ' + page.settings.userAgent);
        page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36';

        var formatDate = iterDate.getFullYear()+'-'+('0'+(iterDate.getMonth()+1)).slice(-2)+'-'+('0'+iterDate.getDate()).slice(-2);
        var iterPlusDate = iterDate;
        iterPlusDate.setDate(iterPlusDate.getDate()+1);
        var formatPlusDate = iterPlusDate.getFullYear()+'-'+('0'+(iterPlusDate.getMonth()+1)).slice(-2)+'-'+('0'+iterPlusDate.getDate()).slice(-2);
        var urlString = firsturlplaceholder + formatDate + secondurlplaceholder + formatPlusDate + thirdurlplaceholder;
        console.log(urlString);
        page.open(urlString, function (status)
        {
            console.log("came here at time=" + new Date());
            if (status !== 'success')
            {
                console.log('Unable to access network');
                console.log(status.toString());
                console.log(
                    "Error opening url \"" + page.reason_url
                    + "\": " + page.reason
                );
                phantom.exit();
            }
            else
            {
                console.log("came here");
                waitFor(function() {
                    // Check in the page if a specific element is now visible
                    return page.evaluate(function() {
                        return $("#room_id_18062202_85076317_2_0").is(":visible")||$("#room_id_18062203_85076317_2_0").is(":visible")||$("#room_id_18062205_85076317_2_0").is(":visible");
                    });
                }, function() {
                    console.log("The roomrates should be visible now.");
                    console.log("rendering image with _00"+i);
                    page.render('webscraper_00'+i+'.png');
                    page.onAlert = function(msg) {
                        console.log(msg);
                    };
                    console.log("came here");
                    var obj = {
                        formatDate:formatDate,
                        formatPlusDate:formatPlusDate

                    };
                    fileStr += page.evaluate(function (obj) {

                        window.console.log = function(msg) { alert(msg) };
                        var extractStandardRoomStr,extractSuperiorRoomStr,extractStandardRoomRefrigeratorStr;
                        //console.log("inner html is "+ document.body.innerHTML);
                        if($("#room_id_18062202_85076317_2_0").is(":visible"))
                        {
                            extractStandardRoomStr = ($('#room_id_18062202_85076317_2_0 strong')).text().trim().match(/\$\d{1,4}\.?\d{0,2}/);
                            console.log("standard room string is "+$('#room_id_18062202_85076317_2_0 strong').text().trim());
                        }
                        else
                        {
                            extractStandardRoomStr = "X";
                        }
                        if($("#room_id_18062203_85076317_2_0").is(":visible"))
                        {
                            extractSuperiorRoomStr = ($('#room_id_18062203_85076317_2_0 strong')).text().trim().match(/\$\d{1,4}\.?\d{0,2}/);

                            console.log("superior room string is "+$('#room_id_18062203_85076317_2_0 strong').text().trim());

                        }
                        else
                        {
                            extractSuperiorRoomStr = "X";
                        }
                        if($("#room_id_18062205_85076317_2_0").is(":visible"))
                        {
                            extractStandardRoomRefrigeratorStr = ($('#room_id_18062205_85076317_2_0 strong')).text().trim().match(/\$\d{1,4}\.?\d{0,2}/);

                            console.log("standardroom with fridge room string is "+$('#room_id_18062205_85076317_2_0 strong').text().trim());
                        }
                        else
                        {
                            extractStandardRoomRefrigeratorStr = "X";
                        }

                        console.log("extract String is " + extractStandardRoomStr);
                        console.log("extract Superior String is " + extractSuperiorRoomStr);
                        console.log("extract Standard with Refrigerator String is " + extractStandardRoomRefrigeratorStr);
                        return $("#hp_hotel_name").text().trim()+","+obj.formatDate+","+obj.formatPlusDate+","+(new Date()).toDateString()+","+extractStandardRoomStr+","+extractSuperiorRoomStr+","+extractStandardRoomRefrigeratorStr+"\n";
                    }, obj);
                    console.log("came after evaluate and filestr is "+fileStr);

                },function(){
                    console.log("this date="+formatDate+" had no rooms left");
                    fileStr+= page.evaluate(function(){return $("#hp_hotel_name").text().trim();})+","+formatDate+","+formatPlusDate+","+(new Date()).toDateString()+",X,X,X\n";
                    console.log("fileStr is "+fileStr);
                    page.close();
                });
            }
        });
        console.log("value of i is "+ i + " at time= "+(new Date()).toString());
        i++;
    }
    else
    {
        clearInterval(intervalI);
        console.log("exiting");
        console.log("fileStr is "+fileStr);
        fs.write("bookingCom_hilohawaii_"+startDate.toDateString()+".csv",fileStr ,function (err) {
            if (err) return console.log(err);
            console.log('error for sample.txt');
        });

        phantom.exit();
    }
},30000);



