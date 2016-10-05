function route(pathname, URL, request, response, query)  {
	return URL[pathname]!=null ? [URL[pathname](request, response, query), "text/html"] : URL["?"](pathname, response, query) ;
}

exports.route = route;