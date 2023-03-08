updateContrast();
updateFonts();
setDay();
changeTimeLaps();
setInterval(changeTimeLaps, 60000);

// Przyciski do sterowania wyświetlania dni tygodnia z pozycjami planu dla widoku mobilnego
const nextDayButtons = document.querySelectorAll('.lesson__button--next');
const previousDayButtons = document.querySelectorAll('.lesson__button--previous');

// pozycje przydziałów i dyżurów
const allocationsAndShifts = document.querySelectorAll('.lesson__position--teacher, .lesson__position--shift, .lesson__position--departments, .lesson__position--class');

var resizeObserver = new ResizeObserver(elements => {
    var planWidth = document.querySelector('.content__plan').clientWidth;
    var quantityOfArea = document.querySelectorAll('.lesson--area').length;
    var quantityOfSelectedDay = document.querySelectorAll('.lesson--day').length;
    var areaCondition = (planWidth - quantityOfArea * 42) / quantityOfSelectedDay;

    for (let element of elements) {

        if (element.contentRect.height < 30 || areaCondition < 210) {
            setShortInformation(element.target);
        }
        else {
            setDetailes(element.target);
        }

        var isShift = element.target.className.indexOf('lesson__position--shift') != -1;

        if (isShift) {

            if (element.contentRect.height < 30) {
                changePlaceShiftPosition(element.target, true);
            }
            else {
                changePlaceShiftPosition(element.target, false);
            }

        }
    }
});

allocationsAndShifts.forEach(element => {
    resizeObserver.observe(element);
    element.setAttribute('onclick', 'onAllocationClick(this)');
    addCharacterBeetween(element);
});

nextDayButtons.forEach(button => {
    button.setAttribute('onClick', 'onNextDayClick(this)');
});

previousDayButtons.forEach(button => {
    button.setAttribute('onClick', 'onPreviousDayClick(this)');
});


/**
 * Metoda rozwija menu dla obiektu podanego jako argument
 */
function expandMenu(selectedItem) {
    var submenu = document.querySelector('.nav__item--' + selectedItem + ' .submenu');
    var arrow = document.querySelector('.nav__item--' + selectedItem + ' .nav__arrow path');
    submenu.classList.toggle("submenu-show");

    var isShow = submenu.classList.contains('submenu-show');

    if (isShow) {
        arrow.setAttribute('d', 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z');
    }
    else {
        arrow.setAttribute('d', 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z');
    }
}

/**
 * Zmiana położenia i godziny timelapsa
 * */
function changeTimeLaps() {
    var isDaysinFirstColumn = document.querySelector("body").getAttribute("data-area") === 'column';
    var timeNow = new Date();
    var startUnitWork = Number(document.querySelector(".plan").getAttribute("data-startHour"));
    var endUnitWork = Number(document.querySelector(".plan").getAttribute("data-endHour"));

    if (timeNow.getHours() < startUnitWork || timeNow.getHours() > endUnitWork) {
        document.querySelector(".plan__timelaps").setAttribute("style", "display: none;")
        return;
    }

    var startTime = new Date();
    startTime.setHours(startUnitWork, 0, 0, 0);

    var hourSize = isDaysinFirstColumn ? 216 : 135;
    var totalMinutes = (timeNow - startTime) / 1000 / 60;
    var position = (hourSize / 60) * totalMinutes;

    if (!isDaysinFirstColumn) {
        document.querySelector(".time").setAttribute("style", "height: " + position + "px");
    }
    else {
        document.querySelector(".time").setAttribute("style", "margin-left: " + position + "px");
    }

    document.querySelector(".time__label").innerHTML = timeNow.toLocaleTimeString().substring(0, 5);
}

function updateContrast() {
    var isHighContrast = sessionStorage.getItem("layoutContrast") === "High";

    if (isHighContrast) {
        document.querySelector("html").setAttribute("data-contrast", "High");
    }
    else {
        document.querySelector("html").setAttribute("data-contrast", "base");
    }
}

function setContrast(isHighContrast) {

    if (isHighContrast) {
        sessionStorage.setItem("layoutContrast", "High");
    }
    else {
        sessionStorage.setItem("layoutContrast", "base");
    }

    updateContrast();
}

function updateFonts() {
    var fontLevel = sessionStorage.getItem("layoutFonts");

    if (fontLevel === 'medium') {
        document.querySelector("html").setAttribute("style", "font-size: 13px");
        document.querySelector(".fonts__item--medium").classList.add("fonts__item--border");
        document.querySelector(".fonts__item--high").classList.remove("fonts__item--border");
        document.querySelector(".fonts__item--default").classList.remove("fonts__item--border");
    }
    else if (fontLevel === 'high') {
        document.querySelector("html").setAttribute("style", "font-size: 16px");
        document.querySelector(".fonts__item--high").classList.add("fonts__item--border");
        document.querySelector(".fonts__item--medium").classList.remove("fonts__item--border");
        document.querySelector(".fonts__item--default").classList.remove("fonts__item--border");
    }
    else {
        document.querySelector("html").setAttribute("style", "font-size: 12px");
        document.querySelector(".fonts__item--default").classList.add("fonts__item--border");
        document.querySelector(".fonts__item--medium").classList.remove("fonts__item--border");
        document.querySelector(".fonts__item--high").classList.remove("fonts__item--border");
    }

}

function setFonts(fontLevel) {

    if (fontLevel === 'medium') {
        sessionStorage.setItem("layoutFonts", "medium");
    }
    else if (fontLevel === 'high') {
        sessionStorage.setItem("layoutFonts", "high");
    }
    else {
        sessionStorage.setItem("layoutFonts", "default");
    }

    updateFonts();
}

/**
 * Ustawia podświetlnenie aktualnego dnia
 * */
function setDay() {
    var numberOfDay = new Date().getDay();
    var lessonInCurrentDays = document.querySelectorAll('.lesson--day');
    var currentDay;

    lessonInCurrentDays.forEach((item => {
        if (parseInt(item.getElementsByClassName('lesson__number-day')[0].innerText) === numberOfDay) {
            currentDay = item;
        }
    }));

    if (!currentDay) {
        return;
    }

    currentDay.classList.add("lesson--current-day");
    currentDay.querySelector('.lesson__header').classList.add('lesson__header--current-day')

    // Ustawiamy domyślnie przyciski next i previous w widoku mobilnym dla aktualnego dnia
    currentDay.classList.add('lesson--open');
}

/**
 * Metoda wywołana, gdy kliknięto w przydział lub dyżur
 */
function onAllocationClick(sourceElement) {
    var popupData = selectDataForPopup(sourceElement);
    createPopup(popupData);

    // Dodanie klasy .wrapper--clip
    var wrapper = document.querySelector(".wrapper");
    wrapper.classList.add("wrapper--clip");
}

/**
 * Metoda wywołana, gdy Kliknięto przycisk next przy dniu tygodnia w mobilnym widoku
 */
function onNextDayClick(element) {
    let nextDay = element.parentElement.parentElement.nextElementSibling;

    if (!nextDay) {
        return;
    }

    element.parentElement.parentElement.classList.remove('lesson--open');
    nextDay.classList.add('lesson--open');
}

/**
 * Metoda wywołana, gdy Kliknięto przycisk previous przy dniu tygodnia w mobilnym widoku
 */
function onPreviousDayClick(element) {
    let previousDay = element.parentElement.parentElement.previousElementSibling;
    let namePreviousDay = previousDay.className;

    if (!previousDay || namePreviousDay.includes("lesson--area")) {
        return;
    }

    element.parentElement.parentElement.classList.remove('lesson--open');
    previousDay.classList.add('lesson--open');
}

/**
 * pobiera odpowiednie dane dla przydziału nauczyciela, sali, oddziału oraz dla dyżurów
 */
function selectDataForPopup(sourceElement) {
    var isTeacher = sourceElement.className.indexOf('lesson__position--teacher') != -1;
    var isShift = sourceElement.className.indexOf('lesson__position--shift') != -1;
    var isClassRoom = sourceElement.className.indexOf('lesson__position--class') != -1;
    var isClass = sourceElement.className.indexOf('lesson__position--departments') != -1;
    var popupData = {
        title: '',
        subject: '',
        teacher: '',
        classRoom: '',
        class: '',
        weeks: '',
        duration: ''
    }

    var isLessonHours = sourceElement.getElementsByClassName('possition__hours').length != 0;

    // Nauczyciel
    if (isTeacher) {
        popupData.title = sourceElement.parentElement.parentElement.parentElement.getElementsByClassName('lesson__header')[0].innerText + ' ' + (isLessonHours ? sourceElement.getElementsByClassName('possition__hours')[0].innerText : '');
        popupData.subject = sourceElement.getElementsByClassName('lesson__item--subject')[0].firstChild.nodeValue;
        popupData.teacher = document.querySelector('.content__header').innerText;
        popupData.weeks = sourceElement.getElementsByClassName('lesson__weeks')[0].innerText;
        popupData.duration = sourceElement.getElementsByClassName('lesson__duration')[0].innerText;

        // Sala
        popupData.classRoom = sourceElement.getElementsByClassName('classroom__label')[0] ? sourceElement.getElementsByClassName('classroom__label')[0].innerHTML : '';

        // Oddział
        popupData.class = sourceElement.getElementsByClassName('lesson__item--class')[0].innerHTML;
    }

    // Dyżur
    if (isShift) {
        popupData.title = sourceElement.parentElement.parentElement.parentElement.getElementsByClassName('lesson__header')[0].innerText + ' ' + (isLessonHours ? sourceElement.getElementsByClassName('possition__hours')[0].innerText : '');
        popupData.subject = sourceElement.getElementsByClassName('shift__area--name')[0].innerText;
        popupData.teacher = document.querySelector('.content__header').innerText;
    }

    // Oddziały
    if (isClass) {
        popupData.title = sourceElement.parentElement.parentElement.parentElement.getElementsByClassName('lesson__header')[0].innerText + ' ' + (isLessonHours ? sourceElement.getElementsByClassName('possition__hours')[0].innerText : '');
        popupData.subject = sourceElement.getElementsByClassName('subject__name')[0].innerText;
        popupData.teacher = sourceElement.getElementsByClassName('lesson__item--class')[0].getElementsByTagName('p')[1].innerHTML;
        popupData.weeks = sourceElement.getElementsByClassName('lesson__weeks')[0].innerText;
        popupData.duration = sourceElement.getElementsByClassName('lesson__duration')[0].innerText;
        popupData.classRoom = '';
        popupData.class = (sourceElement.getElementsByClassName('group__name').length > 0) ? sourceElement.getElementsByClassName('lesson__item--class')[0].getElementsByTagName('p')[0].innerText.split(' ').map(x => document.querySelector('.content__class-short').innerText + '|' + x).join(' + ') : document.querySelector('.content__class-short').innerText;
    }

    // Sale
    if (isClassRoom) {
        popupData.title = sourceElement.parentElement.parentElement.parentElement.getElementsByClassName('lesson__header')[0].innerText + ' ' + (isLessonHours ? sourceElement.getElementsByClassName('possition__hours')[0].innerText : '');
        popupData.subject = sourceElement.getElementsByClassName('lesson__item--subject')[0].innerText;
        popupData.teacher = sourceElement.getElementsByClassName('lesson__item--class')[0].getElementsByTagName('p')[0].innerHTML;//sourceElement.getElementsByClassName('teacher__name')[0].innerHTML;
        popupData.weeks = sourceElement.getElementsByClassName('lesson__weeks')[0].innerText;
        popupData.duration = sourceElement.getElementsByClassName('lesson__duration')[0].innerText;
        popupData.class = sourceElement.getElementsByClassName('lesson__item--class')[0].getElementsByTagName('p')[1].innerHTML;
        popupData.classRoom = document.querySelector('.content__header').innerText;
    }

    return popupData
}

/**
 *     generuje popup, HTML o przykładowej strukturze
 *     <div class="popup">
        <div class="popup__modal">
            <header class="popup__header">
                <div class="popup__title">
                    <h1 class="popup-title__header">poniedzia�ek 08:00 - 08:45</h1>
                </div>
                    <button class="popup__closebtn" tabindex="0" type="button" aria-label="Zamknij okno poniedziałek 08:00 - 08:45" onclick="removePopup()">
                        <span class="closebtn__icon"><svg width="16" height="16" alt="Zamknij okno poniedziałek 08:00 - 08:45">
                                <path class="icon__close"
                                    d="M14.3 15.7L8 9.4l-6.3 6.3-1.4-1.4L6.6 8 .3 1.7 1.7.3 8 6.6 14.3.3l1.4 1.4L9.4 8l6.3 6.3-1.4 1.4z">
                                </path>
                            </svg>
                        </span>
                    </button>
            </header>
            <section class="popup__body">
                <div class="popup__subject">Matematyka</div>
                <div class="popup__teacher">Jan Nowak</div>
                <div class="popup__class-room">A32</div>
                <div class="popup__class">1Ta</div>
                <div class="popup__weeks">Tygodnie: od 1 do 36 </div>
                <div class="popup__duration">Czas trwania [minut]: 45</div>
            </section>
            <footer class="popup__footer"></footer>
        </div>
    </div>
 */
function createPopup(popupData) {
    var popup = document.createElement('div');
    var modal = document.createElement('div');
    popup.setAttribute('class', 'popup');
    modal.setAttribute('class', 'popup__modal');

    // Header
    var popupHeader = document.createElement('header');
    popupHeader.setAttribute('class', 'popup__header');

    var popupTitle = document.createElement('div');
    popupTitle.setAttribute('class', 'popup__title');

    var titleHeader = document.createElement('h1');
    titleHeader.setAttribute('class', 'popup-title__header');
    titleHeader.innerText = popupData.title;

    var popupClose = document.createElement('button');
    popupClose.setAttribute('class', 'popup__closebtn');
    popupClose.setAttribute('tabindex', '0');
    popupClose.setAttribute('type', 'button');
    popupClose.setAttribute('aria-label', 'Zamknij okno ' + popupData.title);
    popupClose.setAttribute('onclick', 'removePopup()');

    var closebtnIcon = document.createElement('span');
    closebtnIcon.setAttribute('class', 'closebtn__icon');

    var closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeSvg.setAttribute('width', '16');
    closeSvg.setAttribute('height', '16');
    closeSvg.setAttribute('alt', 'Zamknij okno ' + popupData.title);

    var closeSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    closeSvgPath.setAttribute('class', 'icon__close');
    closeSvgPath.setAttribute('d', 'M14.3 15.7L8 9.4l-6.3 6.3-1.4-1.4L6.6 8 .3 1.7 1.7.3 8 6.6 14.3.3l1.4 1.4L9.4 8l6.3 6.3-1.4 1.4z');

    // Body
    var popupBody = document.createElement('section');
    popupBody.setAttribute('class', 'popup__body');

    var popupSubject = document.createElement('div');
    popupSubject.setAttribute('class', 'popup__subject');
    popupSubject.innerText = popupData.subject;

    var popupTeacher = document.createElement('div');
    popupTeacher.setAttribute('class', 'popup__teacher');
    popupTeacher.innerHTML = popupData.teacher;

    var popupClassRoom = document.createElement('div');
    popupClassRoom.setAttribute('class', 'popup__class-room');
    popupClassRoom.innerHTML = popupData.classRoom;

    var popupClass = document.createElement('div');
    popupClass.setAttribute('class', 'popup__class');
    popupClass.innerHTML = popupData.class;

    if (popupClass.querySelectorAll('.class__text, .class__link').length > 0) {
        popupClass.querySelectorAll('.class__text, .class__link')[0].innerText = popupClass.querySelectorAll('.class__text, .class__link')[0].innerText.replace('...', '');
    }

    var popupWeeks = document.createElement('div');
    popupWeeks.setAttribute('class', 'popup__weeks');
    popupWeeks.innerText = popupData.weeks;

    var popupDuration = document.createElement('div');
    popupDuration.setAttribute('class', 'popup__duration');
    popupDuration.innerText = popupData.duration;

    // footer
    var popupFooter = document.createElement('footer');
    popupFooter.setAttribute('class', 'popup__footer');

    // Utworzenie struktury zgodnie z powyższym komentarzem
    closeSvg.appendChild(closeSvgPath);
    closebtnIcon.appendChild(closeSvg);
    popupClose.appendChild(closebtnIcon);
    popupTitle.appendChild(titleHeader);
    popupHeader.appendChild(popupTitle);
    popupHeader.appendChild(popupClose);

    popupBody.appendChild(popupSubject);
    popupBody.appendChild(popupTeacher);
    popupBody.appendChild(popupClassRoom);
    popupBody.appendChild(popupClass);
    popupBody.appendChild(popupWeeks);
    popupBody.appendChild(popupDuration);

    modal.appendChild(popupHeader);
    modal.appendChild(popupBody);
    modal.appendChild(popupFooter);
    popup.appendChild(modal);

    document.body.appendChild(popup);

    // Dodanie przecinków między nauczycieli
    var teachers = popupTeacher.querySelectorAll('.item__teacher, .item__classroom');

    if (teachers.length > 0) {
        for (var index in teachers) {
            if (index < teachers.length - 1) {
                var isNextClassRoom = teachers[parseInt(index) + 1].getAttribute('class').indexOf('item__classroom') != -1;
                teachers[index].innerText = teachers[index].innerText.replace(' +', ',');
            }
        }
    }

    // Dodanie brakującego plusa między oddziały
    var classItems = popupClass.querySelectorAll('.class__link, .class__text');

    if (classItems.length > 1) {
        for (var index in classItems) {
            if (index == 0) {
                classItems[index].innerText = classItems[index].innerText.replace('+', '');
                classItems[index].innerText += ' +';
            }
        }
    }
}

/**
 * Usuwa popup ze struktury
 */
function removePopup() {
    var popup = document.getElementsByClassName('popup')[0];
    popup.parentElement.removeChild(popup);

    // Usunięcie klasy .wrapper--clip z wrappera
    var wrapper = document.querySelector(".wrapper");
    wrapper.classList.remove("wrapper--clip");
}

/**
 * Ustawia krótsze informacje o przydziale\dyrzuże
 * @param {any} element - Przydział\dyżur
 */
function setShortInformation(element) {
    var isTeacher = element.className.indexOf('lesson__position--teacher') != -1;
    var isShift = element.className.indexOf('lesson__position--shift') != -1;
    var isClassRoom = element.className.indexOf('lesson__position--class') != -1;
    var isClass = element.className.indexOf('lesson__position--departments') != -1;

    // Nauczyciel
    if (isTeacher) {
        var classes = element.querySelectorAll('.class__link, .class__text');

        if (classes.length > 1) {

            for (var i = 0; i < classes.length; ++i) {

                if (i === 0) {
                    classes[i].innerText = classes[i].innerText.replace(' +', '')
                    classes[i].innerText = classes[i].innerText.replaceAll('.', '');
                    classes[i].innerText = classes[i].innerText + '...'
                }
                else {
                    classes[i].classList.remove('visibility-element');
                    classes[i].classList.add('hide-element');
                }

            }

        }
    }

    // Dyżur
    if (isShift) {
        element.getElementsByClassName(' shift__area--name')[0].style.display = 'none';
        element.getElementsByClassName(' shift__area--short')[0].style.display = 'block';
    }

    // Oddział
    if (isClass) {
        element.getElementsByClassName('subject__name')[0].style.display = 'none';
        element.getElementsByClassName('subject__short')[0].style.display = 'block';
    }

    // Sale
    if (isClassRoom) {
        element.getElementsByClassName('teacher__name')[0].classList.remove('display-element');
        element.getElementsByClassName('teacher__name')[0].classList.add('not-element');
        element.getElementsByClassName('teacher__short')[0].classList.remove('not-element');
        element.getElementsByClassName('teacher__short')[0].classList.add('display-element');
    }
}

/**
 * Ustawia szczegóły na przydziale\dyżurze
 * @param {any} element - przydział\dyżur
 */
function setDetailes(element) {
    var isTeacher = element.className.indexOf('lesson__position--teacher') != -1;
    var isShift = element.className.indexOf('lesson__position--shift') != -1;
    var isClassRoom = element.className.indexOf('lesson__position--class') != -1;
    var isClass = element.className.indexOf('lesson__position--departments') != -1;

    // Nauczyciel
    if (isTeacher) {
        var classes = element.querySelectorAll('.class__link, .class__text');

        if (classes.length > 1) {

            for (var i = 0; i < classes.length; ++i) {

                if (i === 0) {
                    classes[i].innerText = classes[i].innerText.replaceAll(' +', '');
                    classes[i].innerText += ' +'
                    classes[i].innerText = classes[i].innerText.replaceAll('.', '');
                }
                else {
                    classes[i].classList.remove('hide-element');
                    classes[i].classList.add('visibility-element');//.style.visibility = 'visible';
                }

            }

        }
    }

    // Dyżur
    if (isShift) {
        element.getElementsByClassName(' shift__area--name')[0].style.display = 'block';
        element.getElementsByClassName(' shift__area--short')[0].style.display = 'none';
    }

    // Oddział
    if (isClass) {
        element.getElementsByClassName('subject__name')[0].style.display = 'block';
        element.getElementsByClassName('subject__short')[0].style.display = 'none';
    }

    // Sale
    if (isClassRoom) {
        element.getElementsByClassName('teacher__name')[0].classList.remove('not-element');
        element.getElementsByClassName('teacher__name')[0].classList.add('display-element');
        element.getElementsByClassName('teacher__short')[0].classList.remove('display-element');
        element.getElementsByClassName('teacher__short')[0].classList.add('not-element');
    }
}

/**
 * Dodanie znaków między oddziały i Nauczycielii
 * @param {any} sourceElement - przydział
 */
function addCharacterBeetween(sourceElement) {

    // Dodanie plusów między oddziały
    var classItems = sourceElement.querySelectorAll('.class__link, .class__text');

    if (classItems.length > 0) {
        for (var index in classItems) {
            if (index < classItems.length - 1) {
                classItems[index].innerText = classItems[index].innerText.replace('+', '');
                classItems[index].innerText += ' +';
            }
        }
    }

    // Dodanie plusów między nauczycieli
    var teachers = sourceElement.querySelectorAll('.item__teacher, .item__classroom');

    if (teachers.length > 0) {
        for (var index in teachers) {
            if (index < teachers.length - 1) {
                var isNextClassRoom = teachers[parseInt(index) + 1].getAttribute('class').indexOf('item__classroom') != -1;
                teachers[index].innerText = teachers[index].innerText.replace('+', '');
                teachers[index].innerText += (isNextClassRoom) ? '' : ' +';
            }
        }
    }
}

/**
 * Zmiana położenia miejsca dyżurowania w zależności od ilości dostępnego miejsca
 * @private
 * @param {*} element - dyżur nauczyciela
 * @param {*} isSmall - Czy aktualna przestrzeń jest mała (height < 30px) na poprawne wyświetlenie miejsca dyżurowania
 * @returns
 */
function changePlaceShiftPosition(element, isSmall) {
    // nazwa oraz skrót miejsca dyżurowania nauczyciela
    var elementName = element.getElementsByClassName('shift__area--name')[0];
    var elementShort = element.getElementsByClassName('shift__area--short')[0]

    if (isSmall) {
        elementName.style.bottom = '0px';
        elementShort.style.bottom = '0px';

        return;
    }

    elementName.style.bottom = '10px';
    elementShort.style.bottom = '10px';
}