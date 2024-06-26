// static/js/common/datatable.js
import translations from '../l18n/en.js';

export class DataTableManager {
    static initializeDataTable(selector, config) {
        return $(selector).DataTable(config);
    }

    static dataTableRenderAsUrl(host, url, text) {
        const fullPath = url ? `${host}/${url}` : host;
        return `<a href="${fullPath}" target="_blank">${text}</a>`;
    }

    static dataTableRenderAsInput(value) {
        return `<input type="text" class="form-control" value="${value}">`;
    }

    static refreshTable(table) {
        table.ajax.reload();
    }

    static formatLoading() {
        return '<div class="d-flex justify-content-center">' +
               '<div class="spinner-border" role="status">' +
               `<span class="visually-hidden">${translations.labels.dataTablesLoadingText}</span>` +
               '</div>' +
               '</div>';
    }

    static disableAlertErrors()
    {
        $.fn.dataTable.ext.errMode = 'none';
    }

    static handleBootstrapTabs()
    {
        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach((el) => {
            el.addEventListener('shown.bs.tab', () => {
                DataTable.tables({ visible: true, api: true }).columns.adjust();
            });
        });
    }

    static onDataTableXhr(table)
    {
        table.on('xhr', function() {
            var data = table.ajax.json();
            originalData = {};
            data.forEach(function(item) {
                originalData[item.id] = item;
            });
        });
    }

    static customDateRenderer(data, type, row) {
        // Function to parse the date string and determine its components
        function parseDate(dateStr) {
            const dateTimeParts = dateStr.split(' ');
            const dateParts = dateTimeParts[0].split('-');
            const timePart = dateTimeParts.length > 1 ? dateTimeParts[1] : null;
    
            return {
                year: parseInt('20' + dateParts[0], 10),
                month: parseInt(dateParts[1], 10),
                day: parseInt(dateParts[2], 10),
                time: timePart
            };
        }
    
        // Function to format the date
        function formatDate({ day, month, year, time }) {
            let formattedDate = `${day}/${month}/${year}`;
            if (time && time !== '00:00') {
                formattedDate += ` ${time}`;
            }
            return formattedDate;
        }
    
        // Function to calculate time difference
        function timeSince(date) {
            const now = new Date();
            const past = new Date(date.year, date.month - 1, date.day, ...date.time ? date.time.split(':') : [0, 0]);
            const diff = now - past;
            const daysTotal = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const years = Math.floor(daysTotal / 365);
            const days = daysTotal % 365;
        
            if (years > 0) {
                return `${years} ${translations.labels.dataTablesYearText} ${days} ${translations.labels.dataTablesDaysText} ${hours} ${translations.labels.dataTablesHrsText}`;
            } else {
                return `${days} ${translations.labels.dataTablesDaysText} ${hours} ${translations.labels.dataTablesHrsText}`;
            }
        }
    
        const parsedDate = parseDate(data);
    
        // Return different data based on the type of data request
        if (type === 'sort') {
            // Return an ISO format date for correct sorting
            const isoDate = `${parsedDate.year}-${parsedDate.month.toString().padStart(2, '0')}-${parsedDate.day.toString().padStart(2, '0')}`;
            if (parsedDate.time) {
                return isoDate + 'T' + parsedDate.time;
            }
            return isoDate;
        } else if (type === 'display') {
            if (parsedDate.time) {
                if (parsedDate.time === '00:00') {
                    return formatDate(parsedDate);
                } else {
                    const since = timeSince(parsedDate);
                    const fullDate = formatDate(parsedDate);
                    return `<span title="${fullDate}">${since}</span>`;
                }
            } else {
                return formatDate(parsedDate);
            }
        } else {
            // For filtering and type detection, return the formatted date
            return formatDate(parsedDate);
        }
    }

    static returnDefaultLayout()
    {
        let topStart = {
                buttons: [
                    {
                        extend: 'colvis',
                        postfixButtons: ['colvisRestore'],
                        text: '<i class="bi bi-table"></i>',
                        titleAttr: translations.buttons.dataTableColumnVisibilityhButton
                        
                    },
                    {
                        extend: 'searchPanes',
                        className: 'btn btn-secondary',
                        config: {
                            cascadePanes: true
                        }
                        
                    },
                    { 
                        action: function ( e, dt, node, config ) {dt.ajax.reload();},                        
                        text: '<i class="bi bi-arrow-clockwise"></i>',
                        titleAttr: translations.buttons.dataTableRefreshButton
                    },
                    {
                        extend: 'pageLength',
                        className: 'btn btn-secondary'
                    }
                ]
            }

        return topStart;
    }

    static returnDefaultLanguage()
    {
        let language = {
            search: "_INPUT_",
            searchPlaceholder: translations.labels.dataTableSearchInput
        }

        return language;
    }
}

export class EventDelegator {
    constructor(selector, actionHandler) {
      this.selector = selector;
      this.actionHandler = actionHandler;
      this.attachListener();
    }
  
    attachListener() {
      const element = document.querySelector(this.selector);
      if (!element) {
        console.error(`Element with selector "${this.selector}" not found.`);
        return;
      }
  
      element.addEventListener('click', (event) => this.handleButtonClick(event));
    }
  
    handleButtonClick(event) {
      let targetElement = event.target;
      while (targetElement && !targetElement.classList.contains('button') && !targetElement.matches("[class*='action-']")) {
        targetElement = targetElement.parentElement;
      }
  
      if (targetElement && targetElement.matches("[class*='action-']")) {
        const actionNameMatch = targetElement.className.match(/action-(\w+)/);
        if (actionNameMatch) {
          const actionName = actionNameMatch[1];
          this.actionHandler(actionName, targetElement);
        }
      }
    }
  }