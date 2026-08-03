// Props Dash injects into every component, factored out the same way dash-mantine-components keeps them
// in its own `props/dash.ts`. Kept here (not imported from dmc) so this package stays self-contained.

/** Base props present on every Dash component. */
export interface DashBaseProps {
    /**
     * The ID used to identify this component in Dash callbacks. Works as a normal Dash id, including
     * pattern-matching (dict) ids.
     */
    id?: string | object;

    /**
     * Dash-assigned callback that should be called to report property changes to Dash, to make them
     * available for callbacks. Also supports `persistence` the normal Dash way.
     */
    setProps?: (props: Record<string, any>) => void;

    /**
     * Object that holds the loading state object coming from dash-renderer.
     */
    loading_state?: {
        /** Determines if the component is loading or not. */
        is_loading?: boolean;
        /** Holds which property is loading. */
        prop_name?: string;
        /** Holds the name of the component that is loading. */
        component_name?: string;
    };
}
