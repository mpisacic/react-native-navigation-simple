import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, BackHandler, Easing, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  expanded: {
    flex: 1,
    backgroundColor: "#F0FCFE",
  },
});

type NavigationRouteProps<U extends Record<string, any>> = {
  [K in keyof U]: U[K] extends undefined
    ? {
        route: K;
        component: React.ComponentType<U[K]>;
        initialProps?: U[K];
        default?: boolean;
      }
    : {
        route: K;
        component: React.ComponentType<U[K]>;
        initialProps: U[K];
        default?: boolean;
      };
}[keyof U];

type NavigationProps<U extends Record<string, any>> = {
  children:
    | React.ReactElement<NavigationRouteProps<U>>
    | React.ReactElement<NavigationRouteProps<U>>[];
  onHardwareBackPress(navigation: Navigation<U>): void;
};

type NavigateArgs<
  U extends Record<string, any>,
  K extends keyof U
> = U[K] extends undefined
  ? { route: K; props?: U[K] }
  : { route: K; props: U[K] };

type Navigation<U extends Record<string, any>> = {
  navigate: <K extends keyof U>(args: NavigateArgs<U, K>) => void;
};

export function createNavigation<T extends Record<string, any>>() {
  function NavigationRoute(_: NavigationRouteProps<T>) {
    return null;
  }

  type Lookup<V> = Record<keyof T, V>;

  const navigationContext = createContext<Navigation<T> | null>(null);

  function useNavigation(): Navigation<T> {
    const value = useContext(navigationContext);

    if (value === null) {
      throw Error("Navigator component not found in tree.");
    }

    return value as Navigation<T>;
  }

  function Navigation({ children, onHardwareBackPress }: NavigationProps<T>) {
    const opacity = useRef(new Animated.Value(1));

    const onHardwareBackPressRef = useRef(onHardwareBackPress);

    useEffect(() => {
      onHardwareBackPressRef.current = onHardwareBackPress;
    }, [onHardwareBackPress]);

    const [activeRoute, setActiveRoute] = useState<{
      route: keyof T;
      props: T[keyof T] | null;
    }>({ route: "", props: null } as any);

    const [routesLookup, setRoutesLookup] = useState<
      Lookup<NavigationRouteProps<T>>
    >({} as Lookup<NavigationRouteProps<T>>);

    const navigate = useCallback(
      (args: NavigateArgs<T, keyof T>) => {
        Animated.timing(opacity.current, {
          useNativeDriver: true,
          toValue: 0,
          duration: 100,
          easing: Easing.ease,
        }).start(({ finished }) => {
          if (finished) {
            setActiveRoute({
              route: args.route,
              props: args.props || null,
            });
          }
        });
      },
      [opacity]
    );

    useEffect(() => {
      Animated.timing(opacity.current, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    }, [activeRoute]);

    useEffect(() => {
      BackHandler.addEventListener("hardwareBackPress", () => {
        onHardwareBackPressRef.current({ navigate });
        return true;
      });
    }, []);

    useEffect(() => {
      const routes: NavigationRouteProps<T>[] = React.Children.map(
        children,
        (child) => {
          if (child.type !== NavigationRoute) {
            throw Error(
              "Children of navigation must be NavigationRoute components."
            );
          }
          return child.props;
        }
      );

      if (routes.length === 0) {
        throw Error(
          "Empty routes are not allowed. Specify at least one route or remove Navigation from tree."
        );
      }

      const defaultRoute = routes.find((route) => route.default) || routes[0];

      setActiveRoute({
        route: defaultRoute.route,
        props: defaultRoute.initialProps || null,
      });

      setRoutesLookup(
        routes.reduce((lookup, route) => {
          lookup[route.route] = route;
          return lookup;
        }, {} as Lookup<NavigationRouteProps<T>>)
      );
    }, [children]);

    const Component = routesLookup[activeRoute.route]?.component;

    if (!Component) {
      return <View style={styles.expanded} />;
    }

    return (
      <navigationContext.Provider value={{ navigate }}>
        <Animated.View style={[styles.expanded, { opacity: opacity.current }]}>
          <Component {...(activeRoute.props || ({} as T[keyof T]))} />
        </Animated.View>
      </navigationContext.Provider>
    );
  }

  return {
    useNavigation,
    Navigation,
    NavigationRoute,
  };
}
