import gql from 'graphql-tag'
    export default gql`
        query fetchRoute($location: String!, $destination: String!) {
            fetchRoute(location: $location, destination: $destination) {
                items {
                    id
                    from
                    to
                    taxiType
                    routeLocation
                    price
                }
            }
        }`