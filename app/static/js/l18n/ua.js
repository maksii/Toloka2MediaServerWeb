// en.js - English language resource file

const translations = {
    tableHeaders: {
        studioDetails:
        {
            id:'ID',
            name:'Назва',
            telegram:'телеграм',
        },
        anime:
        {
            id:'ID',
            titleUa:'UA',
            titleEn:'EN',
            season:'Сезон',
            type:'Тип',
            status:'Статус',
            releaseDate:'дата випуску',
        },        
        releases:
        {
            codename:'Кодове ім’я',
            torrent_name:'Назва торренту', 
            season_number: 'Номер сезону',
            episode_index:'Індекс епізоду',
            adjusted_episode_number:'Скоригований номер епізоду', 
            publish_date: 'Дата публікації',
            release_group: 'Група випуску', 
            download_dir: 'Директорія завантаження', 
            ext_name: 'Назва розширення', 
            hash: 'Хеш', 
            meta: 'Мета', 
            actions: 'Дії'
        },
        toloka:
        {
            forum: 'Форум',
            name: 'Назва',
            author: 'Автор', 
            date: 'дата',  
            answers: 'відповіді',
            forum_url: 'URL форуму',
            leechers: 'Лічери',
            seeders: 'Сідери',
            size: 'розмір',
            status: 'статус',
            torrent_url: 'URL торренту',
            url: 'URL', 
            verify: 'перевірити',
            actions:'Дії'            
        },
        multi:
        {
            source:'Джерело',
            image:'Зображення', 
            title:'Назва',
            alternative:'альтернатива',
            id:'ID',  
            status:'Статус', 
            mediaType:'Тип медіа' ,
            description:'опис',
            releaseDate: 'Дата випуску' 
        },
        stream:
        {
            provider: 'Провайдер', 
            title: 'Зображення',
            title:'Назва',
            title_eng:'Назва ENG',
            link:'Посилання',
        },
        settings:
        {
            id: 'ID', 
            section: 'Секція',
            key:'Ключ',
            value:'Значення',
        },
    },
    buttons: {
        dataTableRefreshButton: 'Оновити',
        dataTableColumnVisibilityhButton: 'Видимість стовпців',
        releaseAddSubmit: 'Подати',
        releaseAddButton:'Додати',
        releaseUpdateAllButton:'Оновити все',
        releaseEditButton:'Редагувати',
        releaseDeleteButton:'Видалити',
        releaseUpdateButton:'Оновити',
        expandButton:'Розгорнути',
        tolokaDownloadButton:"Пряме завантаження",
        tolokaAddButton:"Додати до клієнта",
        tolokaCopyButton:"Копіювати значення",
        settingSaveButton: "Зберегти",
        settingsAdd:"Додати",
        settingsSyncTo:"Синхронізація з app.ini",
        settingsSyncFrom:"Синхронізація з app.ini",
        settingsUpdateButton:"Оновити"
    },
    labels: {
        dataTableSearchInput: "Фільтрувати записи",
        dataTablesYearText:"роки",
        dataTablesDaysText:"дні",
        dataTablesHrsText:"год тому",
        dataTablesLoadingText:"Завантаження...",
        newVersionToastTitle:"Новий реліз: ",
        operationStatusGithub: "Створіть issue на github, якщо щось не так.",
        buttonsLoadingText:"Завантаження...",
        releaseAddIndex: 'Індекс',
        releaseAddNumber:'Номер',
        noImageAvailable:'Зображення недоступне',
        checkVersions: 'Встановлені пакети'
    },
};

export default translations;