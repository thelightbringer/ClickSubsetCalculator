/**
 * @author Abhijit Misra <mr.abhijit@hotmail.com>
 */

/**
 * Holds FileSystem module
 */
const fs = require('fs'); // FileSystem module to write file

/**
 * Holds Click json
 */
const clicks = require('./clicks.json'); // Clicks json file

/**
 * Generates the result file which is the subset of clicks array.
 * It filters out the clicks array and writes it to a file.
 */
const createResultSet = () => {
    let index = -1;
    const clicksPerIp = getClicksPerIpMap(clicks);
    let result = clicks.reduce((acc, click) => {
        if (clicksPerIp[click.ip] < 11) {
            acc.push({...click});
            index = acc.length - 1;
            acc = getFilteredData(index, acc) 
        }
        return acc;

    }, []);

    result = JSON.stringify(result, null, "\t");

    fs.writeFile("resultset.json", result, function(err, result) {
        if (err) {
            console.log('error', err);
        }
    });
}

/**
 * Generates the object map of IP-NumberOfClicks.
 * @param { Object } totalClicks - Clicks array.
 * @returns { Object } clicksPerIp- Map of IP vs number of clicks
 */
const getClicksPerIpMap = (totalClicks) => {
    const clicksPerIp = {}
    for (let click of totalClicks) {
        clicksPerIp[click.ip] = clicksPerIp[click.ip] ? ++clicksPerIp[click.ip] : 1;
    }
    return clicksPerIp;
}

/**
 * Compares adjacent clicks and returns based upon filtering logic.
 * @param { Number } index - Index of last element in main subset array
 * @param { Array } resultSet - Main subset array
 * @returns { Array } filterArr - Filtered array
 */
const getFilteredData = (index, resultSet) => {
    let filterArr = resultSet;
    if(resultSet.length > 1 && areClicksInSameHour(index, resultSet)) { 
        filterArr = checkForExpensiveClicks(index, resultSet)
    } 
    return filterArr;
}

/**
 * Compares clicks timestamp to see whether it lies in same hour.
 * @param { Number } index - Index of last element in main subset array
 * @param { Array } resultSet - Main subset array
 * @returns { Boolean } isHourDiff - Click lies in same hour or not.
 */
const areClicksInSameHour = (index, resultSet) => {
    let isHourDiff = false;
    const currDate = new Date(resultSet[index].timestamp).getHours();
    const prevDate = new Date(resultSet[index -1].timestamp).getHours();
    isHourDiff = (currDate - prevDate) === 0;
    return isHourDiff;
}

/**
 * Compare amounts of click and returns array with more expensive one
 * @param { Number } index - Index of last element in main subset array
 * @param { Array } resultSet - Main subset array
 * @returns { Array } finalResult - Most expensive click(s) out of the compared.
 */
const checkForExpensiveClicks = (index, resultSet) => {
    let finalResult = [];
    const currClick = resultSet[index];
    const prevClick = resultSet[index - 1];
    const currClickAmount = currClick.amount;
    const prevClickAmount = prevClick.amount;

    if (currClickAmount > prevClickAmount) {
        finalResult = resultSet.slice(0, resultSet.length - 2);
        return [...finalResult, resultSet[index]];
    } else if (currClickAmount < prevClickAmount) {
        finalResult = resultSet.slice(0, resultSet.length - 1);
        return finalResult;
    } else {
        finalResult = resultSet.slice(0, resultSet.length - 1);
        return filterDuplicateIp(currClick, resultSet, finalResult);
    }
}

/**
 * Filter out the clicks with same amount and IP
 * @param { Number } click - Current Click to checked for duplicity.
 * @param { Array } nextResultSet - Result set with all elements.
 * @param { Array } currentResultSet - Result set with Last element removed assuming it is duplicate.
 * @returns { Array } - Returns the array by removing duplicate if any.
 */
const filterDuplicateIp = (click, nextResultSet, currentResultSet) => {
    const isDuplicate = currentResultSet.find(clickItem => clickItem.ip === click.ip && clickItem.amount === click.amount );
    if (isDuplicate) {
        return currentResultSet;
    } 
    return nextResultSet;
}

createResultSet(); // Invoke createResult Method for filtering clicks and writing it to a file

module.exports = {
    getClicksPerIpMap,
    getFilteredData,
    areClicksInSameHour,
    checkForExpensiveClicks,
    filterDuplicateIp,
    createResultSet
};