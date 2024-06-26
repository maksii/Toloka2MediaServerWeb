// static/js/modules/setttings.js
import { DataTableManager, EventDelegator } from '../common/datatable.js';
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';

export default class Settings {
    constructor() {
        this.table = null;
    }

    init() {
        this.initializeDataTable();
        this.addEventListeners();
        this.checkVersions();
        //DataTableManager.onDataTableXhr(this.table);

        document.querySelector("#configuration-tab-pane > div:nth-child(1) > div > div").innerText = translations.labels.settingsNotification;
    }
    settingsTableBody = document.querySelector('#settingsTable tbody');
    collapsedGroups = {};

    initializeDataTable() {
        const config = {
            ajax: {
                url: '/api/settings',
                dataSrc: function(json) {
                    return json;
                }
            },
            responsive: true,
            columns: [
                { data: "id", title: translations.tableHeaders.settings.id, visible: true },
                { data: 'section', title: translations.tableHeaders.settings.section, visible: true, render: function(data, type, row) {
                    if (type === 'display') {
                        return DataTableManager.dataTableRenderAsInput(data);
                    }
                    return data;
                } },
                { data: 'key', title: translations.tableHeaders.settings.key, visible: true, render: function(data, type, row) {
                    if (type === 'display') {
                        return DataTableManager.dataTableRenderAsInput(data);
                    }
                    return data;
                } },
                { data: 'value', title: translations.tableHeaders.settings.value, visible: true, render: function(data, type, row) {
                    if (type === 'display') {
                        return DataTableManager.dataTableRenderAsInput(data);
                    }
                    return data;
                } },
                { data: null, defaultContent: Utils.renderActionButton("action-save","btn-outline-warning", "", "bi-pencil-square", translations.buttons.settingSaveButton) }
            
            ],
            columnDefs: [
                { targets: [0], searchable: false, orderable: false, className: "align-middle" },
                { targets: [1, 2, 3], className: "align-middle" },
                { targets: [4], searchable: false, orderable: false, className: "align-middle text-center" }
            ],
            rowGroup: {
                dataSrc: 'section',
                startRender: (rows, group, level) => {
                    var collapsed = !!this.collapsedGroups[group];
            
                    rows.nodes().each(function (r) {
                      r.style.display = 'none';
                      if (collapsed) {
                        r.style.display = '';
                      }});
            
                    // Add category name to the <tr>. NOTE: Hardcoded colspan
                    return $('<tr/>')
                      .append('<td class="action-collapse" colspan="8">' + group + ' (' + rows.count() + ')</td>')
                      .attr('data-name', group)
                      .toggleClass('collapsed', collapsed);
                  }
            },
            paging: false,
            order: [[1, 'des']],
            layout: {
                topStart: DataTableManager.returnDefaultLayout(),
                top1End:
                {
                    buttons:[
                        {
                            text: translations.buttons.settingsAdd,
                            className: 'btn btn-primary',
                            action: () => {
                                var newRowId = 1;
                                var data = this.table.data().toArray();
                                if (data.length > 0) {
                                    newRowId = Math.max.apply(Math, data.map(function(o) { return o.id; })) + 1;
                                }
                                this.table.row.add({
                                    id: newRowId,
                                    section: '',
                                    key: '',
                                    value: ''
                                }).draw(false);
                        
                                // Focus on the first input of the new row
                                var newRow = this.table.row(':last').node();
                                newRow.querySelector('input:first-child').focus();
                            }
                        },
                        {
                            text: translations.buttons.settingsSyncTo,
                            className: 'btn btn-primary',
                            action: () => {
                                this.syncSettings("to", "app");
                            }
                        },
                        {
                            text: translations.buttons.settingsSyncFrom,
                            className: 'btn btn-primary',
                            action: () => {
                                this.syncSettings("from", "app");
                            }
                        }
                    ]
                }
            },
            language: DataTableManager.returnDefaultLanguage()
        };
        this.table = DataTableManager.initializeDataTable('#settingsTable', config);
        this.settingsTableBody = document.querySelector('#settingsTable tbody');
    }

    addEventListeners() {
        new EventDelegator('#settingsTable tbody', this.handleAction.bind(this));

        document.querySelector('#syncTorrentReleaseTo').addEventListener('click', ()=> {this.syncSettings('to', 'release')}); 
        document.querySelector('#syncTorrentReleaseFrom').addEventListener('click', ()=> {this.syncSettings('from', 'release')}); 
    }

    handleAction(actionName, element) {
        const actionHandlers = {
          save: () => this.saveSettingAction(element),
          collapse: () => this.groupToggle(element),
        };
    
        const actionFunction = actionHandlers[actionName];
        if (actionFunction) {
          actionFunction();
        } else {
          console.error(`No handler defined for action: ${actionName}`);
        }
      }

    syncSettings(direction, type) {
        const url = '/api/settings/sync';
    
        const formData = new FormData();
        formData.append('direction', direction);
        formData.append('type', type);
    
        const fetchOptions = {
            method: 'POST',
            body: formData,
            credentials: 'include', 
            headers: {
                'Accept': 'application/json'
            }
        };
    
        fetch(url, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                DataTableManager.refreshTable(this.table);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    groupToggle(element)
    {
        var name = element.parentElement.getAttribute('data-name');
        this.collapsedGroups[name] = !this.collapsedGroups[name];
        this.table.draw(false);
    }

    saveSettingAction(target)
    {
        const row = this.table.row(target.closest('tr'));
        var rowData = row.data();

        console.log('Original data', rowData);

        const inputs = row.node().querySelectorAll('input');
        var updatedData = {};
        updatedData.section = inputs[0].value;
        updatedData.key = inputs[1].value;
        updatedData.value = inputs[2].value;

        target.disabled = true;
        target.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${translations.buttons.buttonsLoadingText}`;

        let formData = new FormData();
        formData.append('id', rowData.id);
        formData.append('section', updatedData.section);
        formData.append('key', updatedData.key);
        formData.append('value', updatedData.value);
    
        fetch(`/api/settings/${rowData.id}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(detail => {
            target.innerHTML = `<i class="bi bi-arrow-clockwise"></i> ${translations.buttons.settingsUpdateButton}`;
            target.disabled = false;
            this.table.ajax.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            target.innerHTML = `<i class="bi bi-arrow-clockwise"></i> ${translations.buttons.settingsUpdateButton}`;
            target.disabled = false;
        });
        
    }

    checkVersions()
    {
        const showToastButton = document.getElementById('showToast');

        showToastButton.addEventListener('click', () => {
            fetch('/api/settings/versions')
            .then(response => response.json())
            .then(data => {
                const formattedContent = formatContent(data);
                showVersionToast(translations.labels.checkVersions, formattedContent);
            })
            .catch(error => console.error('Error fetching version data:', error));
            });
    
            function showVersionToast(title, content) {
                const toastContainer = document.querySelector('.toast-container');
                const toastHTML = `
                    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                        <div class="toast-header">
                            <strong class="me-auto">${title}</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            ${content}
                        </div>
                    </div>
                `;
                toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                const toastElement = new bootstrap.Toast(toastContainer.lastElementChild);
                toastElement.show();
            }
    
            function formatContent(data) {
                let contentHTML = '<ol class="list-group list-group-numbered">';
                for (const [key, value] of Object.entries(data)) {
                    contentHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-start">
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">${key}</div>
                                ${key}
                            </div>
                            <span class="badge text-bg-primary rounded-pill">${value}</span>
                        </li>
                    `;
                }
                contentHTML += '</ol>';
                return contentHTML;
            }
    }
}