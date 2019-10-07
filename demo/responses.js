const answersMap = {};
const timesMap = {};

const surveyTimes = [];
let numResponses = 0;
const fs = require('fs');

const lineReader = require('readline').createInterface({
    input: fs.createReadStream('demo/response.txt'),
});

function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    let medianNum = 0;
    const numsLen = numbers.length;
    numbers.sort();

    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        medianNum = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        medianNum = numbers[(numsLen - 1) / 2];
    }

    return medianNum.toPrecision(2);
}

function mean(numbers) {
    let total = 0; let i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return (total / numbers.length).toPrecision(2);
}

// Read from each line
lineReader.on('line', (line) => {
    const response = JSON.parse(line);
    const { answers, questionTimes: times, total_survey_elapsed_time: totalSurveyTime } = response;

    surveyTimes.push(totalSurveyTime);

    const answerKeys = Object.keys(answers);
    const timeKeys = Object.keys(times);

    answerKeys.forEach((key) => {
        // Get answer from JSON
        const answer = answers[key];

        // Add answer to global map
        if (!answersMap[key]) {
            answersMap[key] = [];
        }
        answersMap[key].push(answer);
    });

    timeKeys.forEach((key) => {
        // Get answer from JSON
        const time = times[key];

        // Add answer to global map
        if (!timesMap[key]) {
            timesMap[key] = [];
        }
        timesMap[key].push(time);
    });
    numResponses += 1;
});

function stringArrayToNumbersArray(stringArray) {
    return stringArray.map((string) => Number(string));
}

// After file is done reading
lineReader.on('close', () => {
    console.log(JSON.stringify(answersMap));
    console.log(`Number of Responses: ${numResponses}`);

    // Calculate the average for responses

    // Calculate team participation
    const teamArray = answersMap.on_what_team;
    const teamObject = teamArray.reduce((prevValue, currentValue) => {
        const total = prevValue;
        if (!total[currentValue]) {
            total[currentValue] = 0;
        }
        total[currentValue] += 1;
        return total;
    }, {});
    console.log(`Team Participation Distribution:\n${JSON.stringify(teamObject)}`);
    delete answersMap.on_what_team;

    console.log('\n');
    console.log('------Survey Answers-------');
    // Calculate mood
    const moodArray = answersMap.mood;
    const moodAverage = mean(stringArrayToNumbersArray(moodArray));
    console.log(`"mood" Average: ${moodAverage}`);
    delete answersMap.mood;

    // DELETE UNUSED METRICS
    delete answersMap.start_survey;
    const answerKeys = Object.keys(answersMap);

    // Calculate the +1/-1 average
    answerKeys.forEach((key) => {
        const answerArray = answersMap[key];
        const average = mean(stringArrayToNumbersArray(answerArray));
        console.log(`"${key}" Question Average: ${average}`);
    });

    console.log('\n');
    console.log('------Survey Times-------');
    // Calculate the average and median time for response times
    console.log(`Average Survey Time: ${mean(stringArrayToNumbersArray(surveyTimes)) / 1000} seconds`);
    console.log(`Median Survey Time: ${median(stringArrayToNumbersArray(surveyTimes)) / 1000} seconds`);
    const timeKeys = Object.keys(timesMap);

    timeKeys.forEach((key) => {
        const timeArray = timesMap[key];
        const numberArray = stringArrayToNumbersArray(timeArray);
        const average = mean(numberArray);
        const medianTime = median(numberArray);
        console.log(`"${key}" Time Taken Average: ${average / 1000} seconds`);
        console.log(`"${key}" Time Taken Median: ${medianTime / 1000} seconds`);
    });
});
