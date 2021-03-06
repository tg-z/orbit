const path = window.location.pathname;
const pretty_title = path.slice(1);
const head = document.getElementsByTagName("head");
const title = document.getElementById("title");
const blocks = document.getElementById("blocks");
const loadMoreBtn = document.getElementById("load-more");
const loadingEl = document.getElementById("loading");
let perPage = 60;
let page = 0;
let loading = false;
let initialSetup = false;
let CONTENT = [];
function init() {
	document.title = pretty_title;
	makeRequest();

	loadMoreBtn.addEventListener("click", () => {
		if (!loading) {
			makeRequest();
		}
	});
}
function setupContent(data) {
	data.map((item) => {
		var div = document.createElement("div");
		// console.log(item);
		if (item.class == "Text") {
			div.classList.add("text");
			div.innerHTML = `
                                ${item.content_html}
                            `;
		} else if (item.class == "Link") {
			div.classList.add("link");
			div.innerHTML = `
                                <a href="${item.source.url}" class="block_link" target="_blank">${item.title}</a>
                            `;
		} else if (item.class == "Image") {
			div.classList.add("image");
			div.innerHTML = `
                                <figure><img src="${item.image.large.url}"/></figure>
                                <caption>${item.content}</caption>
                            `;
		} else if (item.class == "Attachment") {
			if (item.attachment.content_type == "video/mp4") {
				div.classList.add("video");
				div.innerHTML = `
                                    <video controls>
                                        <source src="${item.attachment.url}" type="video/mp4">
                                    </video>
                                `;
		} else if (item.class == "Media") {
			div.classList.add("media");
			div.innerHTML = `
			        ${item.embed.html}
				`;
			}
		}
		if (item.title == "stylesheet") {
			var css = item.content,
				head =
					document.head ||
					document.getElementsByTagName(
						"head"
					)[0],
				style = document.createElement("style");
			head.appendChild(style);
			style.type = "text/css";
			if (style.styleSheet) {
				// This is required for IE8 and below.
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}
		} else {
			blocks.appendChild(div);
		}
	});
}
function conclude() {
	// callback once there are no more blocks to add
	// moved reverse function here once posts are loaded
	endLoading();
	loadMoreBtn.remove();
}
function startLoading() {
	loading = true;
	loadMoreBtn.classList.remove("able-to-load");
	loadingEl.classList.remove("done-loading");
}
function endLoading() {
	window.scrollTo(0, window.scrollY + loadMoreBtn.offsetHeight);
	loading = false;
	loadingEl.classList.add("done-loading");
}
function makeRequest() {
	startLoading();
	// limit ... to 20x64
	if (page === false) return false;
	page++;
	fetch(`/api${path}?page=${page}&per=${perPage}`)
		.then((response) => response.json())
		.then((data) => {
			if (data.length < perPage) {
				setupContent(data);
				conclude();
				page = false;
				return false;
			} else {
				loadMoreBtn.classList.add("able-to-load");
			}
			// keep appending to the content array
			// CONTENT = [...CONTENT, ...data]
			endLoading();
			setupContent(data);
		})
		//2 do add error support
		.catch((error) => console.error(error));
}
document.addEventListener("DOMContentLoaded", init);
