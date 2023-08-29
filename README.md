# react-native-navigation-simple

Simple zero-dependency Javascript-only navigation for React Native with Typescript support!

The goal of this package is to provide an alternative to other popular React Native navigation packages when there is a need for a simple navigational patterns (usually simple navigation between a couple of screen) and/or wanting to have more control of number of external dependencies app is using.

This package does not have any external dependencies and is not dependent of underlying platform on which it is being executed, since all of navigation work is done in pure React. At the moment this poses a limitation since there is not stack-like tracking of routes history or similar bahaviours. If you have a need for a more complex use-case, feel free to give this package a try if it can be used as a base and implement your own logic on top of it.

## Installation

    npm i react-native-navigation-simple

## Usage

First, define your routes as a type. Navigation supports flatten routes structure where every route component can have it's props defined. Define routes as a new type, let's say you want to have three screens: home, details and settings.

```typescript
type NavigationRoutes = {
    Home: undefined;
    Details: DetailsProps;
    Settings: undefined.
}
```

In order to start using navigation, you need to instantiate it using provided factory function.

First, import the function from the package:

```typescript
import { createNavigation } from "react-native-navigation-simple";
```

Then, instantiate it using provided NavigationRoutes type, preferrably in some separate file:

```typescript
import { createNavigation } from 'react-native-navigation-simple';

type NavigationRoutes = {
    Home: undefined;
    Details: DetailsProps;
    Settings: undefined.
}

export type RouteName = keyof NavigationRoutes;

const { useNavigation, Navigation, NavigationRoute } = createNavigation<NavigationRoutes>();

export {
    useNavigation,
    Navigation,
    NavigationRoute,
};
```

Somewhere in the root of your app, add navigation with defined routes as navigation configuration:

```typescript
import { Navigation, NavigationRoute } from "./your-custom-file";

function App() {
  return (
    <Navigation>
      <NavigationRoute route="Home" component={HomeScreen} default />
      <NavigationRoute
        route="Details"
        component={DetailsScreen}
        initialProps={/* Your component props */}
      />
      <NavigationRoute route="Game" component={SettingsScreen} />
    </Navigation>
  );
}
```

If you want to navigate to some arbitrary route from some component, import the `useNavigation` hook which will return `navigation` instance, and use it to navigate to a route:

```typescript
function MyCustomComponent() {
    const navigation = useNavigation();

    const navigateToRoute = () => {
        navigation.navigate({
            route: 'Details',
            props: /* component props */,
        });
    }

    // ... rest of component's code
}
```

## Advanced

`Navigation` component has an optional prop `onHardwareBackPress`, which is fired when the hardware back press is detected (usually on Android). Parameter to callback fired is `navigation` instance, the same one which is returned from `useNavigation` hook. This prop can be used to implement stack-like navigation or to return to specific route.
