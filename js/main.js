var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1zlPU58xhX6_kVVgDNDBPalFKYa9ENiPBbEwJwbZ_ocQ/edit?usp=sharing';

function init() {
  window.selectionState = {};
  Tabletop.init(
    { key: publicSpreadsheetUrl,
      callback: showInfo,
      simpleSheet: false
    })
}

function populateSchedule(master) {
  const category = window.selectionState.category.toLowerCase().trim();
  const jurisdiction = window.selectionState.jurisdiction.toLowerCase().trim();
  const scheduleRows = [];

  for (let i = 0; i < master.length; i++) {
    const row = master[i];
    const rowCategory = row.Category.trim();
    const rowJurisdiction = row.Jurisdiction.trim();
    if (rowCategory.toLowerCase() === category
        && rowJurisdiction.toLowerCase() === jurisdiction) {
      const date = row.Date;
      const reportingTime = row['Reporting Time'];
      const location = row.Location;
      const duration = row.Duration;
      const activity = row.Event;
      const changedDate = row['Change Date'].trim();
      scheduleRows.push({
        date,
        reportingTime,
        location,
        duration,
        activity,
        changedDate
      });
    }
    scheduleRows.sort(function(a,b){
      const comp = new Date(a.date.trim()) - new Date(b.date.trim());
      if (comp === 0) {
        return new Date('1970/01/01 ' + a.reportingTime)
          - new Date('1970/01/01 ' + b.reportingTime);
      } else {
        return comp;
      }
    });
  }

  const tableElement = document.getElementById('scheduleTable');
  for (let i = 0; i < scheduleRows.length; i++) {
    const row = scheduleRows[i];

    const newRow = document.createElement('tr');

    const dateTd = document.createElement('td');
    dateTd.innerText = row.date;
    newRow.appendChild(dateTd);
    const reportingTimeTd = document.createElement('td');
    reportingTimeTd.innerText = row.reportingTime;
    newRow.appendChild(reportingTimeTd);
    const locationTd = document.createElement('td');
    locationTd.innerText = row.location;
    newRow.appendChild(locationTd);
    const durationTd = document.createElement('td');
    durationTd.innerText = row.duration;
    newRow.appendChild(durationTd);
    const activityTd = document.createElement('td');
    activityTd.innerText = row.activity;
    newRow.appendChild(activityTd);

    if (row.changedDate) {
      newRow.className = 'changed';
    }

    tableElement.appendChild(newRow);
  }
}

function getCategoriesForJurisdiction(master) {
  const jurisdiction = window.selectionState.jurisdiction;
  let categories = new Set();
  for (let i = 0; i < master.length; i++) {
    const row = master[i];
    if (jurisdiction.trim().toLowerCase() === row.Jurisdiction.trim().toLowerCase() &&
        !categories.has(row.Category)) {
      categories.add(row.Category.trim());
    }
  }
  categories = Array.from(categories);
  categories.sort();
  return categories;
}

function populateCategories(elements, master) {
  const buttonGroup = document.getElementById('categoriesButtons');
  const categories = getCategoriesForJurisdiction(master);
  for (let i = 0; i < categories.length; i++) {
    const categoryName = categories[i];
    if (categoryName) {
      const newButton = document.createElement('button');
      newButton.className = 'flat-button';
      newButton.innerText = categoryName;
      newButton.onclick = function() {
        window.selectionState.category = categoryName;
        populateSchedule(master);
        Reveal.next();
      };
      const surroundingDiv = document.createElement('DIV');
      surroundingDiv.appendChild(newButton);
      buttonGroup.appendChild(surroundingDiv);
    }
  }
}

function populateJurisdictions(elements, master) {
  const buttonGroup = document.getElementById('jurisdictionButtons');
  const col1 = document.createElement('DIV');
  const col2 = document.createElement('DIV');
  col1.className = 'flat-button-group';
  col2.className = 'flat-button-group';
  let left = true;
  for (let i = 0; i < elements.length; i++) {
    const jurisdictionName = elements[i].Jurisdictions;
    const newButton = document.createElement('button');
    newButton.className = 'flat-button';
    newButton.innerText = jurisdictionName;
    newButton.onclick = function() {
      window.selectionState.jurisdiction = jurisdictionName;
      populateCategories(elements, master);
      Reveal.next();
    };
    const surroundingDiv = document.createElement('DIV');
    surroundingDiv.appendChild(newButton);
    if (left) {
      col1.appendChild(surroundingDiv);
    } else {
      col2.appendChild(surroundingDiv);
    }
    left = !left;
  }
  buttonGroup.appendChild(col1);
  buttonGroup.appendChild(col2);
}

function showInfo(data, tabletop) {
  populateJurisdictions(data.Meta.elements, data['Master Data'].elements);
  // populateCategories(data.Meta.elements, data['Master Data'].elements);
  Reveal.addEventListener( 'slidechanged', function( event ) {
    // event.previousSlide, event.currentSlide, event.indexh, event.indexv
    if (event.previousSlide.id === 'scheduleSection') {
      const tableElement = document.getElementById('scheduleTable');
      while (tableElement.childElementCount > 1) {
        tableElement.removeChild(tableElement.lastChild);
      } 
    } else if (event.currentSlide.id === 'jurisdictionSection') {
      const buttonGroup = document.getElementById('categoriesButtons');
      while (buttonGroup.firstChild) {
        buttonGroup.removeChild(buttonGroup.firstChild);
      }
    }
  } );
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', function() {
  const numSeconds = 60 * 5;
  let timeoutId;
  function resetTimer() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function() { location.reload() }, numSeconds * 1000);
  }
  document.body.addEventListener('mousemove', resetTimer);
  document.body.addEventListener('keydown', resetTimer);
  document.body.addEventListener('click', resetTimer);
  document.body.addEventListener('touchstart', resetTimer);

  resetTimer();
});

// function checkin() {
//   const indices = Reveal.getIndices(document.getElementById('southAmerica'));
//   Reveal.slide( indices.h, indices.v );
// }