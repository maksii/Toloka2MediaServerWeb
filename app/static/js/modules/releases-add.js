// static/js/modules/releases-add.js
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';

export default class ReleasesAdd {
    init() {
        this.addEventListeners();
    }

    urlButton = document.querySelector('#urlButton');
    filenameIndex = document.querySelector('#filenameIndex');
    filenameIndexGroup = document.querySelector('#filenameIndexGroup');
    cutButton = document.querySelector('#cutButton');
    releaseTitle = document.querySelector('#releaseTitle');
    submitButton = document.querySelector('#submitButton');
    releaseForm = document.querySelector('#releaseForm');  

    addEventListeners() {
        this.urlButton.addEventListener('click', () => { this.filenameIndexGroup.classList.toggle("d-none"); });
        this.filenameIndex.addEventListener('input', () => this.extractNumbers());
        this.cutButton.addEventListener('click', () => this.cutTextTillSeparator());
        this.releaseForm.addEventListener('submit', async (e) => { await this.submitAddNewTitleForm(e) });
    }

    handleTableClick(event) {
        let target = event.target;
        while (target && !target.classList.contains('action-update')) {
            if (target === event.currentTarget) return;
            target = target.parentNode;
        }
        if (target && target.classList.contains('action-update')) {
            this.updateRelease(target);
        }
    }

    extractNumbers() {
        const input = this.filenameIndex.value;
        const numbers = input.split('').map((ch) => (ch >= '0' && ch <= '9') ? ch : ' ').join('').trim().split(/\s+/);
        const resultList = document.querySelector('#numberList');
        resultList.innerHTML = '';
    
        numbers.forEach((number, index) => {
            if (number !== '') {
                const item = document.createElement('div');
                item.className = 'list-group-item';
                item.textContent = `${translations.labels.releaseAddIndex}: ${index+1}, ${translations.labels.releaseAddNumber}: ${number}`;
                item.addEventListener('click', () => {
                    document.querySelector('#index').value = index + 1;
                    resultList.style.display = 'none';
                });
                resultList.appendChild(item);
            }
        });
    
        resultList.style.display = numbers.join('').length === 0 ? 'none' : 'block';
    }

    cutTextTillSeparator()
    {
        const delimiterIndex = this.releaseTitle.value.search(/[\/|]/);
        if (delimiterIndex !== -1) {
            this.releaseTitle.value = this.releaseTitle.value.substring(delimiterIndex + 1);
        }
    }

    async submitAddNewTitleForm(e)
    {
        e.preventDefault();
        submitButton.innerHTML = Utils.renderButtonSpinner();
        submitButton.disabled = true;
        const formData = new FormData(releaseForm);
        const response = await fetch('/api/releases', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        submitButton.innerHTML = translations.buttons.releaseAddSubmit;
        submitButton.disabled = false;

        const bsOperationOffcanvas = new bootstrap.Offcanvas('#offcanvasOperationResults')
        Utils.generateOperationResponseOffCanvas(result);  // Display operation status
        bsOperationOffcanvas.toggle()
    }

}