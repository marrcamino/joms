import Home from "$routes/home.svelte";
import OfficeRoute from "$routes/offices/index.svelte";
import NewEmployee from "$routes/employees/new/index.svelte";
import Test from "$routes/test/index.svelte";
import {
  House,
  Users,
  Building,
  TestTubeDiagonal,
  type IconProps,
} from "@lucide/svelte/icons";
import { type Component } from "svelte";
import {
  wrap as oldWrap,
  type WrapOptions as OldWrapOptions,
} from "svelte-spa-router/wrap";
import { type WrappedComponent as OldWrappedComponent } from "svelte-spa-router";
import NotFound from "./components/not-found.svelte";
import OfficeView from "$routes/offices/[office_id]/index.svelte";

// route type
type ROUTES_MAP = VisibleInNavigation | HiddenInNavigation;

type VisibleInNavigation = {
  title: string;
  url: string;
  icon: Component<IconProps, {}, "">;
  page: Component | WrappedComponent;
};

type HiddenInNavigation = {
  title?: never;
  icon?: never;
  url: string;
  page: Component | WrappedComponent;
};

// custom async type
type CustomAsyncComponent = () => Promise<{ default: Component }>;

// custom WrapOptions
interface CustomWrapOptions extends Omit<OldWrapOptions, "asyncComponent"> {
  asyncComponent?: CustomAsyncComponent;
}

// custom WrappedComponent (replaces ComponentType → Component)
interface WrappedComponent extends Omit<OldWrappedComponent, "component"> {
  component: Component;
}

// custom wrap() returning WrappedComponent
function wrap(options: CustomWrapOptions): WrappedComponent {
  return oldWrap(options as OldWrapOptions) as unknown as WrappedComponent;
}

export const ROUTES: ROUTES_MAP[] = [
  {
    title: "Home",
    url: "#/",
    icon: House,
    page: Home,
  },

  {
    title: "Employees",
    url: "#/employees",
    icon: Users,
    page: wrap({
      asyncComponent: () => import("$routes/employees/index.svelte"),
    }),
  },

  {
    title: "Offices",
    url: "#/offices",
    icon: Building,
    page: OfficeRoute,
  },

  {
    url: "#/offices/*",
    page: wrap({
      asyncComponent: () => import("$routes/offices/[office_id]/index.svelte"),
    }),
  },
  {
    title: "Test",
    url: "#/test",
    icon: TestTubeDiagonal,
    page: Test,
  },

  {
    url: "#/employees/new",
    page: NewEmployee,
  },
  {
    url: "*",
    page: NotFound,
  },
] as const;
