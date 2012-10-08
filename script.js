var a = $LO({"test": "test",
             "test2": {
                "subtest": {
                    "subsubtest": 34,
                    "subsubtest2": {
                        "subsubsubtest": "yeah!"
                    }
                },
                 "subtest2": "subtest2",
                 "subfunction": function () {
                     console.log('...work');
                 },
                 "subarray": [1,2,3,4],
                 "subarray2": [
                     {"a": "b"},
                     {"c": "d"}
                 ],
                 "computedValue": $LO.computed(function (root, dataField) {

                    /* this здесь родительский объект (test2)
                    *  root - родительский LiveObject
                    *  dataField - ячейка с оригинальными данными
                    * */

                     //console.log(this.parent().test);

                     return this.subarray[2] + " computed function work!";
                 }),
                 "eventable": $LO.eventable("eventable function", {
                     "onSet": function (newValue, eventTarget, eventType, dataField) {
                         console.log('on set handler. responsed value: ' + newValue);
                         console.log(eventTarget);
                         console.log(eventType);
                         console.log(dataField);
                     },
                     "onGet": function (value, eventType, dataField) {
                         console.log('on get handler. value: ' + value);
                         console.log(this);
                         console.log(eventType);
                         console.log(dataField);
                     }
                 })
             },
             "test3": "blabla",
             "test4": $LO.bind("#test", "checked")
             }, {
                /* common events handlers */
                "onSet": function (newValue, eventTarget, eventType, dataField) {
                     console.log('common set handler. responsed value: ' + newValue);
                },
                "onGet": function (value, eventType, dataField) {
                     console.log('common get handler. value: ' + value);
                },
                "onPush": function (value, eventType) {
                    console.log("common push handler. value: " + value);
                    console.log(this);
                },
                "onDelete": function (numder, eventType, dataField) {
                    console.log("common delete handler");
                    console.log(this);
                }
             });


var standartSettings = { //JSON structure

    'player': {
        'width': 900,
        'height': null,
        'currentSong': 'music/test1.ogg',
        'playlistLabel': 'playlist'

    },
    'playlist': {
        'fields': [
        {
            'name': 'title',
            'label': 'Название',
            'searchable': true,
            'sortable': true,
            'visible': true
        },
        {
            'name': 'artist',
            'label': 'Артист',
            'searchable': true,
            'sortable': true,
            'visible': true
        },
        {
            'name': 'album',
            'label': 'Альбом',
            'searchable': true,
            'sortable': true,
            'visible': true
        },
        {
            'name': 'country',
            'label': 'Страна',
            'searchable': true,
            'sortable': true,
            'visible': true
        }
    ],
    'songs': [
        /*{title: 'testSong', artist: 'Tester', src: 'music/test1.ogg'},
        {title: 'test2', artist: 'Michael Jackson', src: '/Users/zephyr/Music/iTunes/iTunes Media/Music/Moth Equals/Dreamcoat/03 His Story Repeats Itself.mp3'},
        {title: 'test3', artist: 'John Lennon', src: 'music/test3.ogg'},
        {title: 'test4', artist: 'John Lennon23', src: 'music/test2.ogg'},
        {
            title: 'title', //title of song
            artist: 'artist',
            album: 'testalbum',
            year: '2004',
            src: 'music/test1.ogg',
            country: 'ru' //!
            // other parameters cut out from itunes
        }*/
    ]
    }
};

/*for(var i = 0; i < 10000; i++) {
    standartSettings.playlist.songs.push({title: 'testSong', artist: 'Tester', src: 'music/test1.ogg'});
}

var startTime = new Date();
    for(var i = 0; i < standartSettings.playlist.songs.length; i++){
        console.log(standartSettings.playlist.songs[i].title != null);
    }
var endTime = new Date();
console.log('without LO: ' + (endTime - startTime));

var player = $LO(standartSettings, {
    "onPush": function (value) {
    }
});

console.log('----');

var startTime2 = new Date();
    for(var k = 0; k < player.playlist.songs.length; k++){
        console.log(standartSettings.playlist.songs[k].title != null);
    }
var endTime2 = new Date();
console.log('with LO: ' + (endTime2 - startTime2));*/
