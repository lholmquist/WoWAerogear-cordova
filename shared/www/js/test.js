$( function() {
    var data = [
    {
        id: 12345,
        name: "One",
        thing: {
            value1: "things",
            value2: "value2"
        }
    },
    {
        id: 67890,
        name: "Two",
        thing: {
            value1: "things",
            value2: "value2",
            value3: "value3"
        }
    }
    ];
    var filterParameter = { value1: "things" };

    var filtered = data.filter( filterer );

    console.log( filtered );

    function filterer( value, index, array ) {
        var i,
            paramResult = false,
            matched = false,
            keys = Object.keys( value ),
            filterKeys = Object.keys( filterParameter )[0];

        for( i=0; i<keys.length; i++ ) {
            var innerValue = value[ keys[ i ] ] ;
            if( typeof( innerValue ) === "object" ) {
                return filterer( innerValue, index, array );
            } else {
                if( filterParameter[ filterKeys ] === innerValue && keys[ i ] === filterKeys ) {
                    paramResult = true;
                }
            }

            if( paramResult ) {
                matched = true;
                break;
            }
        }

        return matched;
    }
});