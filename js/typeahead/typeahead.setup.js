/**
 * Created by aditya on 10/11/14.
 */

var states1 = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
    'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];



// constructs the suggestion engine
var states = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
// `states` is an array of state names defined in "The Basics"
    local: $.map(states1, function(state) { return { value: state }; })
});

// kicks off the loading/processing of `local` and `prefetch`
states.initialize();


//nbaTeams.initialize();
//nhlTeams.initialize();

$('#typeahead-search .typeahead').typeahead({
        highlight: true
    },
    {
        name: 'nba-teams',
        displayKey: 'team',
        source: states.ttAdapter(),
        templates: {
            header: '<h3 class="league-name">NBA Teams</h3>'
        }
    }
//    ,{
//        name: 'nhl-teams',
//        displayKey: 'team',
//        source: nhlTeams.ttAdapter(),
//        templates: {
//            header: '<h3 class="league-name">NHL Teams</h3>'
//        }
//    }
);