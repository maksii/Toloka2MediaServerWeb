// static/js/modules/releases.js
import { DataTableManager, EventDelegator } from '../common/datatable.js';
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';
import user from '../common/user.js';

export default class Releases {
    constructor() {
        this.table = null;
    }

    init() {
        this.initializeDataTable();
        new EventDelegator('#dataTableTitles tbody', this.handleAction.bind(this));
        this.addEventListeners();

        this.table.on( 'draw', function () {
            Utils.activeTooltips();
        } );
        
    }

    tableBody = document.querySelector('#dataTableTitles tbody');

    initializeDataTable() {
        const config = {
            ajax: {
                url: 'api/releases',
                dataSrc: function(json) {
                    if (json.error) {
                        return [];  // Return an empty array to DataTables
                    }
                    var result = [];
                    Object.keys(json).forEach(function(key) {
                        var item = json[key];
                        item.codename = key;
                        result.push(item);
                    });
                    return result;
                },
                error: function(xhr, error, thrown) {
                    console.log(xhr.responseJSON.error)
                }
            },
            responsive: true,
            columns: [
                { data: 'codename', title: translations.tableHeaders.releases.codename, visible: true },
                { data: 'torrent_name', type:'html', title: translations.tableHeaders.releases.torrent_name, render: (data, type, row) => { return this.dataTableRenderTorrentInfo(data, type, row) }, visible: true },
                { data: 'season_number', title: translations.tableHeaders.releases.season_number , visible: false},
                { data: 'episode_index', title: translations.tableHeaders.releases.episode_index, visible: false },
                { data: 'adjusted_episode_number', title: translations.tableHeaders.releases.adjusted_episode_number, visible: false },
                { data: 'publish_date', title: translations.tableHeaders.releases.publish_date, render: function(data, type, row) { return DataTableManager.customDateRenderer(data, type, row)}, visible: true  },
                { data: 'release_group', title: translations.tableHeaders.releases.release_group, visible: false },
                { data: 'download_dir', title: translations.tableHeaders.releases.download_dir, visible: false },
                { data: 'ext_name', title: translations.tableHeaders.releases.ext_name, visible: false },
                { data: 'guid', title: translations.tableHeaders.releases.guid, render: function(data, type, row) { return DataTableManager.dataTableRenderAsUrl("https://toloka.to", data, data)}, visible: true },
                { data: 'hash', title: translations.tableHeaders.releases.hash, visible: false },
                { data: 'meta', title: translations.tableHeaders.releases.meta, visible: false },
                { data: null, title: translations.tableHeaders.releases.actions, orderable: false, render: (data, type, row) => { return this.dataTableRenderActionButtons(data, type, row) }, visible: true }
            ],
            order: [[5, 'des']],
            columnDefs: [
                {
                    searchPanes: {
                        show: true
                    },
                    targets: [1, 6, 8]
                }
            ],
            layout: {
                topStart: DataTableManager.returnDefaultLayout(),
                top1End:
                {
                    buttons:[
                        {
                            text: translations.buttons.releaseAddButton,
                            className: 'btn btn-primary',
                            action: () => { Utils.addRelease(); }
                        },
                        {
                            text: translations.buttons.releaseUpdateAllButton,
                            className: 'btn btn-primary',
                            action: ( e, dt, node, config) => { this.dataTableUpdateAllAction(e, dt, node, config)}
                        }
                    ]
                }
            },
            language: DataTableManager.returnDefaultLanguage()
        }
        this.table = DataTableManager.initializeDataTable('#dataTableTitles', config);
        this.tableBody = document.querySelector('#dataTableTitles tbody');
    }

    dataTableRenderTorrentInfo(data, type, row)
    {
        let cleanedValue = data.replace(/^"|"$/g, '');
        if (type === 'display') {
            if(row.torrent_info == null) 
                {
                    row.torrent_info = {};
                    row.torrent_info.progress = 0;
                    row.torrent_info.name = "Not Found";
                    row.torrent_info.state = "Not Found";
                }
                let progress = row.torrent_info.progress;
                progress = Utils.progressPercentage(progress);
                let progressColor = Utils.getColorForProgress(progress);

                let name = row.torrent_info.name;
                let state = row.torrent_info.state;

                let tooltip = `<span style="color: ${progressColor};"
                    data-bs-toggle="tooltip" data-bs-placement="top"
                    data-bs-custom-class="custom-tooltip"
                    data-bs-title="${state} | ${progress} | ${name}">${cleanedValue}</span>`
                return tooltip;
        }
        return cleanedValue;
    }

    dataTableRenderActionButtons(data, type, row) {
        let editButton = Utils.renderActionButton("action-edit","btn-outline-warning", "", "bi-pencil-square", translations.buttons.releaseEditButton);
        let deleteButton = Utils.renderActionButton("action-delete","btn-outline-danger", "", "bi-trash", translations.buttons.releaseDeleteButton);
        let updateButton = Utils.renderActionButton("action-update","btn-outline-primary", "", "bi-arrow-clockwise", translations.buttons.releaseUpdateButton);
        return `${editButton}
        ${deleteButton}
        ${updateButton}`;
    }

    dataTableUpdateAllAction(e, dt, node, config)
    {
        node[0].disabled = true;
        node[0].innerHTML = Utils.renderButtonSpinner();

        fetch('/api/releases/update', { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            node[0].innerHTML = `<i class="bi bi-arrow-clockwise"></i> ${translations.buttons.releaseUpdateAllButton}`;
            node[0].disabled = false;

            const bsOperationOffcanvas = new bootstrap.Offcanvas('#offcanvasOperationResults');
            Utils.generateOperationResponseOffCanvas(result);  // Display operation status
            bsOperationOffcanvas.toggle();
            DataTableManager.refreshTable(this.table);
        });
    }

    addEventListeners() {
        document.querySelector('#editReleaseSubmitForm').addEventListener('click', ()=> {this.submitEditForm()});
    }

    handleAction(actionName, element) {
        let tr = element.closest('tr');
        let row = this.table.row(tr).data();

        const actionHandlers = {
          edit: () => this.populateEditForm(element, row),
          delete: () => this.deleteRelease(element, row),
          update: () => this.updateRelease(element, row),
        };
    
        const actionFunction = actionHandlers[actionName];
        if (actionFunction) {
          actionFunction();
        } else {
          console.error(`No handler defined for action: ${actionName}`);
        }
      }

    deleteRelease(target, row)
    {
        target.disabled = true;
        target.innerHTML = Utils.renderButtonSpinner();

        let formData = new FormData();
        formData.append('codename', row.codename);

        fetch('/api/releases', {
            method: 'DELETE',
            body: formData
        })
        .then(response => response.json())
        .then(detail => {
            target.innerHTML = `<span class="bi bi-trash" aria-hidden="true"></span><span class="visually-hidden" role="status">${translations.buttons.releaseDeleteButton}</span>`;
            target.disabled = false;
            debugger
            DataTableManager.refreshTable(this.table);
        })
        .catch(error => {
            console.error('Error:', error);
            target.innerHTML = `<span class="bi bi-trash" aria-hidden="true"></span><span class="visually-hidden" role="status">${translations.buttons.releaseDeleteButton}</span>`;
            target.disabled = false;
        });
    }

    populateEditForm(target, formData) {

        const form = document.getElementById('dataForm');
        form.innerHTML = '<div class="row">';  // Start with a row for the columns
    
        // Helper function to create a column
        const createColumn = () => {
            const col = document.createElement('div');
            col.className = 'col-md-4';  // Divide the form into 3 columns
            return col;
        };
    
        let currentColumn = createColumn();
        let fieldCount = 0;
    
        // Sort keys to ensure 'codename' is first
        const keys = Object.keys(formData).sort((a, b) => {
            if (a === 'codename') return -1;
            if (b === 'codename') return 1;
            return 0;
        });
    
        keys.forEach(key => {
            if (key === 'torrent_info') return; // Skip the 'torrent_info' field
    
            // Create a new column after every 5 fields
            if (fieldCount % 5 === 0 && fieldCount !== 0) {
                form.firstChild.appendChild(currentColumn);
                currentColumn = createColumn();
            }
    
            const value = formData[key].replace(/"/g, '&quot;'); // Handle complex values
            const div = document.createElement('div');
            div.className = 'form-floating mb-3';
            div.innerHTML = `
                <input type="text" class="form-control" id="${key}" name="${key}" placeholder="${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}" value="${value}">
                <label for="${key}">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
            `;
            currentColumn.appendChild(div);
            fieldCount++;
        });
    
        // Append the last column
        form.firstChild.appendChild(currentColumn);
        form.innerHTML += '</div>';  // Close the row
    
        // Open the modal after populating the form
        const modalElement = new bootstrap.Modal(document.getElementById('editRelease'));
        modalElement.show();
    }

    submitEditForm()
    {
        const formData = new FormData(document.getElementById('dataForm'));
        fetch('/api/releases', {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(data => DataTableManager.refreshTable(this.table))
        .catch(error => console.error('Error:', error));
        const modalElement = document.getElementById('editRelease');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }
    

    async updateRelease(target, row) {

        target.disabled = true;
        target.innerHTML = Utils.renderButtonSpinner();

        // Assuming `codename` is a property of the row data
        let formData = new FormData();
        formData.append('codename', row.codename);

        fetch('/api/releases/update', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(detail => {
            target.innerHTML = `<i class="bi bi-arrow-clockwise"></i> ${translations.buttons.releaseUpdateButton}`;
            target.disabled = false;

            const bsOperationOffcanvas = new bootstrap.Offcanvas('#offcanvasOperationResults');
            Utils.generateOperationResponseOffCanvas(detail);  // Display operation status
            bsOperationOffcanvas.toggle();
            DataTableManager.refreshTable(this.table);
        })
        .catch(error => {
            console.error('Error:', error);
            target.innerHTML = `<i class="bi bi-arrow-clockwise"></i> ${translations.buttons.releaseUpdateButton}`;
            target.disabled = false;
        });
    }
}