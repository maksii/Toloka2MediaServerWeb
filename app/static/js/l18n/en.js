// en.js - English language resource file

const translations = {
    tableHeaders: {
        studioDetails:
        {
            id:'ID',
            name:'Name',
            telegram:'telegram',
        },
        anime:
        {
            id:'ID',
            titleUa:'UA',
            titleEn:'EN',
            season:'Season',
            type:'Type',
            status:'Status',
            releaseDate:'releaseDate',
        },        
        releases:
        {
            codename:'Codename',
            torrent_name:'Torrent Name', 
            season_number: 'Season Number',
            episode_index:'Episode Index',
            adjusted_episode_number:'Adjusted Episode Number', 
            publish_date: 'Publish Date',
            release_group: 'Release Group', 
            download_dir: 'Download Dir', 
            ext_name: 'Ext Name',
            guid: 'Toloka ID', 
            hash: 'Hash', 
            meta: 'Meta', 
            actions: 'Actions'
        },
        toloka:
        {
            forum: 'Forum',
            name: 'Title',
            author: 'Author', 
            date: 'date',  
            answers: 'answers',
            forum_url: 'forum_url',
            leechers: 'Leechers',
            seeders: 'Seeders',
            size: 'size',
            status: 'status',
            torrent_url: 'torrent_url',
            url: 'url', 
            verify: 'verify',
            actions:'Actions'            
        },
        multi:
        {
            source:'Source',
            image:'Image', 
            title:'Title',
            alternative:'alternative',
            id:'ID',  
            status:'Status', 
            mediaType:'Media Type' ,
            description:'description',
            releaseDate: 'Release Date' 
        },
        stream:
        {
            provider: 'Provider', 
            title: 'Image',
            title:'Title',
            title_eng:'Title ENG',
            link:'Link',
        },
        settings:
        {
            id: 'ID', 
            section: 'Section',
            key:'Key',
            value:'Value',
        },
    },
    buttons: {
        dataTableRefreshButton: 'Refresh',
        dataTableColumnVisibilityhButton: 'Column Visibility',
        releaseAddSubmit: 'Submit',
        releaseAddButton:'Add',
        releaseUpdateAllButton:'Update All',
        releaseEditButton:'Edit',
        releaseDeleteButton:'Delete',
        releaseUpdateButton:'Update',
        expandButton:'Expand',
        tolokaDownloadButton:"Direct Download",
        tolokaAddButton:"Add to client",
        tolokaCopyButton:"Copy Values",
        settingSaveButton: "Save",
        settingsAdd:"Add",
        settingsSyncTo:"Sync to app.ini",
        settingsSyncFrom:"Sync from app.ini",
        settingsUpdateButton:"Update"
    },
    labels: {
        dataTableSearchInput: "Filter records",
        dataTablesYearText:"years",
        dataTablesDaysText:"days",
        dataTablesHrsText:"hrs ago",
        dataTablesLoadingText:"Loading...",
        newVersionToastTitle:"New Release: ",
        operationStatusGithub: "Create an issue on github if something wrong.",
        buttonsLoadingText:"Loading...",
        releaseAddIndex: 'Index',
        releaseAddNumber:'Number',
        noImageAvailable:'No image available',
        checkVersions: 'Installed Packages',
        settingsNotification: 'Page shows last saved settings in DB. Please use Sync to and Sync from to keep them up to date state.'
    },
};

export default translations;