# AUTO GENERATED FILE - DO NOT EDIT

#' @export
weekRangePickerInput <- function(id=NULL, className=NULL, clearable=NULL, closeOnChange=NULL, firstDayOfWeek=NULL, forceColorScheme=NULL, highlightToday=NULL, loading_state=NULL, maxDate=NULL, minDate=NULL, persisted_props=NULL, persistence=NULL, persistence_type=NULL, placeholder=NULL, presets=NULL, style=NULL, theme=NULL, value=NULL, withWeekNumbers=NULL) {
    
    props <- list(id=id, className=className, clearable=clearable, closeOnChange=closeOnChange, firstDayOfWeek=firstDayOfWeek, forceColorScheme=forceColorScheme, highlightToday=highlightToday, loading_state=loading_state, maxDate=maxDate, minDate=minDate, persisted_props=persisted_props, persistence=persistence, persistence_type=persistence_type, placeholder=placeholder, presets=presets, style=style, theme=theme, value=value, withWeekNumbers=withWeekNumbers)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'WeekRangePickerInput',
        namespace = 'dash_week_range_picker',
        propNames = c('id', 'className', 'clearable', 'closeOnChange', 'firstDayOfWeek', 'forceColorScheme', 'highlightToday', 'loading_state', 'maxDate', 'minDate', 'persisted_props', 'persistence', 'persistence_type', 'placeholder', 'presets', 'style', 'theme', 'value', 'withWeekNumbers'),
        package = 'dashWeekRangePicker'
        )

    structure(component, class = c('dash_component', 'list'))
}
