class WorkDay {

    date: Date;
    hours: number;
    private workingTime: string;
    actualTime: number;
    loggedTime: number;

    setWorkingTime(start: number, end: number) {
        if (!start && !end) this.workingTime = undefined;
        else this.workingTime = `${start}:00 - ${end}:00`;
    }

    getWorkingTime() {
        return this.workingTime;
    }

}

class Days {

    static readonly DAY_IN_MS_MULTIPLIER = 1000 * 60 * 60 * 24;

    days: WorkDay[];

    constructor(startDate: Date) {

        this.days = [];
        for (let i = 0; i < 7; i++) {

            this.days[i] = new WorkDay();
            this.days[i].date = new Date(startDate.getTime() + i * Days.DAY_IN_MS_MULTIPLIER);

        }

    }

}

class TimeSheets {

    today: Date;
    startYear: Date;

    currentWeekNum: number;
    nextWeekNum: number;

    currentWeek: Days;
    nextWeek: Days;

    twoLastDigitsOfCurrentYear: number;

    constructor() {
        this.today = new Date();
        this.startYear = new Date(`${this.today.getFullYear()}-01-01`);
        this.getWeeks();
        this.currentWeek = new Days(this.weeksToDate(this.currentWeekNum));
        this.nextWeek = new Days(this.weeksToDate(this.nextWeekNum));
        this.twoLastDigitsOfCurrentYear = this.startYear.getFullYear() % 100;
    }

    getWeeks() {

        this.currentWeekNum = Math.ceil(((this.today.getTime() - this.startYear.getTime())) / Days.DAY_IN_MS_MULTIPLIER / 7);
        this.nextWeekNum = this.currentWeekNum + 1;
        console.log((this.today.getTime() - this.startYear.getTime()) / (Days.DAY_IN_MS_MULTIPLIER * 7));

    }

    weeksToDate(week: number): Date {

        return new Date((week - 1) * 7 * Days.DAY_IN_MS_MULTIPLIER + this.startYear.getTime() - Days.DAY_IN_MS_MULTIPLIER);

    }
}

var timeSheet = new TimeSheets();

const iife = (function () {

    let alertEvent = new Event('alert');
    let alertTimeout = setTimeout(() => {}, 0);

    let formIsValid = true;
    const mainTitle = `Parttime Working Hours – w${timeSheet.nextWeekNum}${timeSheet.twoLastDigitsOfCurrentYear}`;
    const prevTitle = `${(timeSheet.today.getDay() === 1) ? 'Previous' : 'Current'} week: w${timeSheet.currentWeekNum}${timeSheet.twoLastDigitsOfCurrentYear}`;
    const nextTitle = `${(timeSheet.today.getDay() === 1) ? 'Current' : 'Next'} week: w${timeSheet.nextWeekNum}${timeSheet.twoLastDigitsOfCurrentYear}`;

    let alert = <HTMLInputElement>document.querySelector('.alert');
    let alertCloseBtn = document.getElementById('alert-area-warn__close-btn');

    renderForm();

    document.getElementById('f1').addEventListener('submit', onSubmit);

    alert.addEventListener('alert', showAlert);
    alertCloseBtn.addEventListener('click', function () {
        this.parentElement.classList.remove('show');
    });


    function showAlert() {
        if (alert.classList.contains('show')) return;
        clearTimeout(alertTimeout);
        alert.classList.add('show');

        alertTimeout = setTimeout(() => {
            alert.classList.remove('show');
        }, 3000);

    }

    function dayNumFormatter(day: WorkDay): string {
        return ('0' + (day.date.getDate()).toString()).slice(-2);
    }

    function monthNumFormatter(day: WorkDay): string {
        return ('0' + (day.date.getMonth() + 1).toString()).slice(-2);
    }

    function timeSheetFormForCurrentWeek(): string {

        let resultString = ``;
        timeSheet.currentWeek.days.forEach((day, index) => {
            let idx = index + 1;
            resultString +=
                `<div class ="time-sheet-curr-week__day">` +
                `<span ${(idx > 5) ? 'class ="weekend"' : 'class ="weekday"'}>${dayNumFormatter(day)}/${monthNumFormatter(day)}</span>` +
                `<input id="wts${idx}" type = "text"><span class = 'minutes-digits'>:00</span> - <input id="wte${idx}" type = "text">:00, Logged <input id="lt${idx}" type = "text">h` +
                `</div>`;
        });

        return `<div class="time-sheet-main-form__curr-week">${resultString}</div>`;

    }

    function timeSheetFormForNextWeek(): string {

        let resultString = ``;
        timeSheet.nextWeek.days.forEach((day, index) => {
            let idx = index + 1;

            resultString += `<div class ="time-sheet-next-week__day">` +
                `<span ${(idx > 5) ? 'class ="weekend"' : 'class ="weekday"'}>${dayNumFormatter(day)}/${monthNumFormatter(day)} </span>` +
                `<input id="nwts${idx}" type = "text">:00 - </span><input id="nwte${idx}" type = "text">:00` +
                `</div>`;
        });

        return `<div class="time-sheet-main-form__next-week">${resultString}</div>`;

    }

    function renderForm() {
        let innerString = `<span>${mainTitle}</span></br>`;
        innerString += `<span>${prevTitle}</span>`;
        innerString += timeSheetFormForCurrentWeek();
        innerString += `<span>${nextTitle}</span>`;
        innerString += timeSheetFormForNextWeek();

        document.getElementById('main').innerHTML =
            `<form id = "f1">` +
            `${innerString}` +
            `<button type = "submit" class="form-btn">click</button></form>`;
    }

    function renderAnswer() {

        let innerString = `<textarea class="time-sheet-answer__text-area">` + `${iife.mainTitle}\n\n` + `${iife.prevTitle}\n`;
        let actualCounter = 0;
        let loggedCounter = 0;
        let nextWeekCounter = 0;

        timeSheet.currentWeek.days.forEach((day) => {
            if (!!day.getWorkingTime()) {
                actualCounter += day.actualTime;
                loggedCounter += day.loggedTime;
                innerString +=
                    `${dayNumFormatter(day)}/${monthNumFormatter(day)} ${day.getWorkingTime()} - ` +
                    `Actual ${day.actualTime}, Logged ${day.loggedTime}\n`;
            }
        });

        innerString += `\n${iife.nextTitle}\n`;

        timeSheet.nextWeek.days.forEach((day) => {
            if (!!day.getWorkingTime()) {
                nextWeekCounter += day.hours;
                innerString += `${dayNumFormatter(day)}/${monthNumFormatter(day)} ${day.getWorkingTime()}  - ${day.hours}h \n`;
            }
        });

        innerString += `</textarea>`;
        innerString += `<button class="time-sheet-answer__copy-btn">` +
            `<img src="./assets/copy-content.svg">` +
            `</button>`;
        innerString += `<button class="time-sheet-answer__download-btn">` +
            `<img src="./assets/download-content.svg">` +
            `</button>`;

        if ((actualCounter - loggedCounter !== 0)) {
            innerString += `<div class ="time-sheet-answer__err">` +
                `<div class="alert alert-primary" role="alert">` +
                `<h4 class="alert-heading">Did you really mean that?</h4>` +
                `<p>${(actualCounter > loggedCounter) ? 'Actual time' : 'Logged time'} might be invalid</p>` +
                `<hr>` +
                `<p class="mb-0"><strong>actual time:</strong> ${actualCounter}h</p>` +
                `<p class="mb-0"><strong>logged time:</strong> ${loggedCounter}h</p>` +
                `</div>` +
                `</div>`;
        } else {
            innerString += `<div class ="time-sheet-answer__err">` +
                `<div class="alert alert-success" role="alert">` +
                `<h4 class="alert-heading">Here we go!</h4>` +
                `<hr>` +
                `<p class="mb-0">time for ${(timeSheet.today.getDay() === 1) ? 'previous' : 'current'} week : ${actualCounter}h</p>` +
                `<p class="mb-0">time for ${(timeSheet.today.getDay() === 1) ? 'current' : 'next'} week : ${nextWeekCounter}h</p>` +
                `</div>` +
                `</div>`;
        }
        if (!iife.formIsValid) {
            innerString = `<span>oopsie doopsie</span><span>double check your data</span>`;
            alert.dispatchEvent(alertEvent);
        }
        document.getElementById('answer').innerHTML = innerString;
    }

    function onSubmit(e: Event) {

        e.preventDefault();
        iife.formIsValid = true;

        timeSheet.currentWeek.days.forEach((day, index) => {
            const wts = <HTMLInputElement>document.getElementById(`wts${index + 1}`);
            const wte = <HTMLInputElement>document.getElementById(`wte${index + 1}`);
            // const att = <HTMLInputElement>document.getElementById(`at${index + 1}`);
            const ltt = <HTMLInputElement>document.getElementById(`lt${index + 1}`);
            timeValidation(wts, wte) ? day.setWorkingTime(+wts.value, +wte.value) : day.setWorkingTime(null, null);
            day.actualTime = +wte.value - +wts.value;
            day.loggedTime = +ltt.value;
        });

        timeSheet.nextWeek.days.forEach((day, index) => {
            const nwts = <HTMLInputElement>document.getElementById(`nwts${index + 1}`);
            const nwte = <HTMLInputElement>document.getElementById(`nwte${index + 1}`);
            const hrs = <HTMLInputElement>document.getElementById(`hrs${index + 1}`);
            timeValidation(nwts, nwte) ? day.setWorkingTime(+nwts.value, +nwte.value) : day.setWorkingTime(null, null);
            day.hours = +nwte.value - +nwts.value;
        });
        renderAnswer();
        initCopyBtn();
        initDownloadBtn();
    }

    function timeValidation(workTimeStart: HTMLInputElement, workTimeEnd: HTMLInputElement): boolean {
        if (!workTimeStart.value && !workTimeEnd.value) return false;

        let flag = (+workTimeEnd.value - +workTimeStart.value >= 0);
        let parent = workTimeStart.parentElement;
        if (!flag) {
            parent.classList.add('_invalid');
        } else if (parent.classList.contains('_invalid')) {
            parent.classList.remove('_invalid');
        }
        iife.formIsValid = iife.formIsValid && flag;
        return flag;

    }

    function initCopyBtn() {
        const copyTextareaBtn = document.querySelector('.time-sheet-answer__copy-btn');
        const copyTextArea = <HTMLInputElement>document.querySelector('.time-sheet-answer__text-area');

        if(!!copyTextareaBtn) copyTextareaBtn.addEventListener('click', function (event) {
            copyTextToClipboard((copyTextArea.value));
            this.classList.add('_active');
            setTimeout(() => {
                this.classList.remove('_active');
            }, 2000);
        });
    }

    function initDownloadBtn() {
        const downloadTextareaBtn = document.querySelector('.time-sheet-answer__download-btn');
        const copyTextArea = <HTMLInputElement>document.querySelector('.time-sheet-answer__text-area');

        if(!!downloadTextareaBtn)downloadTextareaBtn.addEventListener('click', function (event) {
            download(copyTextArea.value, `w${'[' + timeSheet.currentWeekNum + '-' + timeSheet.nextWeekNum + ']' + timeSheet.twoLastDigitsOfCurrentYear}`, 'text/plain');

            this.classList.add('_active');
            setTimeout(() => {
                this.classList.remove('_active');
            }, 2000);
        });
    }

    function copyTextToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(function () {
            console.log('Copying to clipboard was successful!');
        }, function (err) {
            console.error('Could not copy text: ', err);
        });
    }

    function download(data: any, filename: string, type: string) {
        let file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }


    return {

        mainTitle: mainTitle,
        prevTitle: prevTitle,
        nextTitle: nextTitle,
        formIsValid: formIsValid,
        download: download

    }

})();

// render();

