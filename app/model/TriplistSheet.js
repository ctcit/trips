(function () {
    "use strict";
    // Interface to the Google Sheet used to print a trip list

    angular.module('tripSignupApp').factory("TriplistSheet",
        [
        function () {
            var CLIENT_ID = '977423780607-nlc9pqgfa1bn0ksvue4p4ct1cs78qtph.apps.googleusercontent.com';
            var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
            var TRIPLIST_MASTER_ID = '1isIxA9Vm6798sRB_siTtGUBpIENVL4AU5V8m2Jvg5Qw';
            var SHEET_CELLS = {
                title: 'B3',
                date: 'B4',
                length: 'D4',
                leader: 'B5',
                members: 'A9:D'
            };
            
            // Utility function to extract the row number from a range
            // Assume column <= Z
            function getRow(range) {
                return parseInt(range.substring(1));
            }
            
            function TriplistSheet() {
                // Constructor
            }
            
            angular.extend(TriplistSheet.prototype, {
                /**
                 * Build the spreadsheet 
                 */
                build: function (title, date, length, leader, members, notes) {
                    console.log("Building:");
                    console.log("Date = " + date);
                    console.log("Length = " + length);
                    console.log("Leader = " + leader);
                    console.log("Members = " + members);
                    this.title = title;
                    this.date = date;
                    this.length = length;
                    this.leader = leader;
                    this.members = members;
                    this.notes = notes;
                    
                    gapi.auth.authorize(
                    {
                      'client_id': CLIENT_ID,
                      'scope': SCOPES.join(' '),
                      'immediate': true
                    }, this.handleAuthResult.bind(this));
                },
                /**
                * Handle response from authorization server.
                *
                * @param {Object} authResult Authorization result.
                */
                handleAuthResult: function (authResult) {
                    var discoveryUrl =
                        'https://sheets.googleapis.com/$discovery/rest?version=v4';
                    if (authResult && !authResult.error) {
                        gapi.client.load(discoveryUrl).then(this.plugInData.bind(this));
                    } else {
                        alert("Oops! Authorisation error. Please report.");
                    }
                },
                
                plugInData: function() {
                    console.log("Plugging in data");
                    gapi.client.sheets.spreadsheets.values.batchUpdate(
                        {
                            spreadsheetId:   TRIPLIST_MASTER_ID,
                            valueInputOption: 'RAW',
                            data: this.prepareData()
                        }
                    ).then(function(response) {
                            console.log("Update succeeded");
                        }, function(response) {
                            alert(response.result.error.message);
                    });
                },
                
                prepareData: function() {
                    console.log("Prepare data called");
                    var data = [],
                        values,
                        member,
                        hasCar,
                        range,
                        row;
                    for (var key in SHEET_CELLS) {
                        range = SHEET_CELLS[key];
                        if (this[key] !== undefined) {
                            if (key === 'members') {
                                values = [];
                                for (var i = 0; i < this.members.length; i++) {
                                    member = this.members[i];
                                    hasCar = member.isVehicleProvider ? 'Yes' : '';
                                    values.push([member.name, member.email, member.phone, hasCar]);
                                }
                                data.push({range: range,
                                           majorDimension: 'ROWS',
                                           values: values
                                          });
                            } else {
                                data.push({
                                    range: range,
                                    majorDimension: 'ROWS',
                                    values: [
                                      [this[key]]
                                    ]
                                  })
                            }
                        }
                    }
                    if (this.notes) {
                        row = getRow(SHEET_CELLS['members']) + this.members.length + 2;
                        values = [['NOTES']];
                        for (var i = 0; i < this.notes.length; i++) {
                            values.push([this.notes[i]]);
                        }
                        data.push({
                            range: 'A' + row,
                            majorDimension: 'ROWS',
                            values: values
                        })
                    }
                    console.log("Returning data:" + data);
                    return data;
                }
            });
            return TriplistSheet;
        }]
    );
}());


