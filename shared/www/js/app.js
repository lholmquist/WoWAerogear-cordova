$( function() {
    alert("in");
    var url = "http://us.battle.net/api/wow/achievement/2",
        baseURL = "http://us.battle.net/api/wow/";

//a jquery version for a baseline to make sure it worked
    /*$.ajax( {
        type:'GET',
        url:url,
        contentType: 'application/json',
        dataType: 'jsonp',
        jsonp: 'jsonp',
        jsonpCallback: 'customCallback',
        success: function( data ){
            console.log( data );
        }
    });*/

    var pipeline = AeroGear.Pipeline();
    var stores = AeroGear.DataManager();

    pipeline.add([
        {
            name: "realmStatus",
            settings: {
                baseURL: baseURL,
                endpoint: "realm/status",
                jsonp: {
                    jsonp: 'jsonp'
                    //callback: 'customCallback'
                }
            }
        }
    ]);

    var realmStatusPipe = pipeline.pipes.realmStatus;
    stores.add( [
        {
            name: "realmStatusStore",
            settings: {
                recordId: "slug"
            }
        },
        {
            name: "pvpStatusStore"
        }
    ]);
    var realmStatusStore = stores.stores.realmStatusStore;
    var pvpStatusStore = stores.stores.pvpStatusStore;
    readPipe();

    $( "ul#realms" ).on( "click", buildDetails );
    $( "ul#realmsDetail" ).on( "click", buildPVPDetails );
    $( "ul#pvpListView" ).on( "click", function( event ) {
        var target = event.target;
        if( target.nodeName === "A" ) {
            $.mobile.changePage( "#details", { changeHash: false, transition: "slide", reverse: true } );
        }
    });
    $( "#refresh" ).on( "click", readPipe );

    function readPipe() {
        $.mobile.loading( "show" );
        realmStatusPipe.read( {
            success:function( data ) {
                updateRealmStatus();
                $.mobile.loading( "hide" );
            },
            error:function( data ) {
                console.log( data );
            },
            stores: realmStatusStore
        });
    }

    function updateRealmStatus() {
        realmStatusStore.save(realmStatusStore.read()[ 0 ].realms,true);
        //did the above because datamanger can't filter beyond one layer yet
        var outsideList = $( "#realms" );
        _.each( realmStatusStore.read(), function( realm ) {
            buildTable( realm ).appendTo( outsideList );
        });

        outsideList.listview( "refresh" );
        var footers = $("div[ data-role='footer']").empty();
        footers.each( function() {
            $(this).append( "Data Updated:" + new Date() );
        });
    }

    function buildTable( realm ) {
        var row = $( "<li>" );
        row.append( $( "<a>" ).append( realm.name ).attr( { id: realm.slug } ) );
        return row;
    }

    function buildDetails( event ) {
        var id = event.target.id,
            realm = realmStatusStore.read( id )[0],
            keys = Object.keys( realm ),
            outsideList = $( "#realmsDetail" ).empty(),
            pvpKeys,
            i;

        outsideList.append( $( "<li>" ).append( "Name: " + realm.name ).attr( { id: "name" } ) );
        for( i=0; i<keys.length; i++ ) {
            var currentKey = keys[ i ];

            if( typeof( realm[ currentKey ] ) !== "object" ) {
                if( keys[ i ] !== "slug" && keys[ i ] !== "name" ) {
                    outsideList.append( $( "<li>" ).append( toTitleCase( currentKey ) + " : " + realm[ currentKey ] ).attr( { id:currentKey } ) );
                }
            } else {
                outsideList.append( $( "<li>" ).append( $( "<a>" ).append( toTitleCase( currentKey ) ) ) );
            }
        }
        $.mobile.changePage( "#details", { changeHash: false, transition: "slide" } );
        pvpStatusStore.save( realm, true );
        outsideList.listview( "refresh" );
    }

    function buildPVPDetails( event ) {
        var target = event.target,
        targetName,
        record,
        pvpKeys,
        a,
        temp,
        outsideList;

        outsideList = $( "#pvpListView" ).empty();

        if( !target.id ) {
            targetName = target.text.toLowerCase(),
            realm = pvpStatusStore.getData()[ 0 ],
            record = realm[ targetName ],
            pvpKeys = Object.keys( record );

            var pvpStatuses = {
                "-1": "Unknown",
                "0": "Idle",
                "1": "Populating",
                "2": "Active",
                "3": "Concluded"
            };
            outsideList.append( $( "<li>" ).append( $( "<a>" ).append( realm.name + " : " + toTitleCase( targetName ) ) ) );

            for( a=0; a<pvpKeys.length; a++ ) {
                if( pvpKeys[ a ] !== "area" ) {
                    switch( pvpKeys[ a ] ) {
                        case "controlling-faction":
                            temp = record[ pvpKeys[ a ] ] === 0 ? "Alliance" : "Horde";
                             break;
                        case "next":
                            temp = new Date( record[ pvpKeys[ a ] ] );
                            break;
                        case "status":
                            temp = pvpStatuses[ record[ pvpKeys[ a ] ] ];
                    }
                    outsideList.append( $( "<li>" ).append( toTitleCase( pvpKeys[ a ] ) + " : " + temp ) );
                }
            }

            $.mobile.changePage( "#pvpDetails", { changeHash: false, transition: "slide" } );
            outsideList.listview( "refresh" );
        }
    }

    function toTitleCase( str ) {
        return str.replace( /\w\S*/g, function( txt ){
            return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
        });
    }


});
