var dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var moy = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Initialize(obj,source,metadata) {
	var prop;
	
	for (prop in source) {
		obj[prop] = source[prop];
	}
	
	for (prop in metadata) {
		obj[prop] = 
			metadata[prop].Type == "tinyint(1)" ?	(obj[prop] == true) :
			metadata[prop].Type == "date" ? 	(obj[prop] == null ? null : LocalDate(obj[prop])) :
								(obj[prop] == null ? "" : obj[prop].toString());
	}
}

function ToSql(value, metadata)
{
	return	metadata.Type == "tinyint(1)" ?	(value ? 1 : 0) :
		metadata.Type == "date" ?	(UtcDate(value).toISOString().substr(0,10)) : value;
}

function LocalDate(value)
{
	value = new Date(value);
	value.setMinutes(value.getMinutes()+value.getTimezoneOffset());
	return value;
}

function UtcDate(value)
{
	value = new Date(value);
	value.setMinutes(value.getMinutes()-value.getTimezoneOffset());
	return value;
}

function ValidateResponse(response)
{
	if (typeof(response) == "string")
	{
		state.savestate = response;
		state.$timeout(function() {state.$scope.$apply();}, 0);
	}
	
	return typeof(response) == "object";
}

function AnimationSlide() {
	return {
		beforeAddClass: function(element, className, done) {
			if(className === 'ng-hide') {
				element.slideUp(done);
			}
		},
		removeClass: function(element, className, done) {
			if(className === 'ng-hide') {
				element.hide().slideDown(done);
			}
		}
	}
}