class GithubProfileFinder {
    constructor() {
        this.githubForm = document.getElementById("githubForm");
        this.userControl = document.getElementById("user");
        this.githubContainer = document.getElementById("githubContainer");
        this.card = document.getElementById("card");
        this.loader = document.getElementById("loader");
        this.themeBtn = document.getElementById("themeBtn");

        this.BASE_URL = "https://api.github.com/users";

        this.loadTheme();
        this.addEvents();
    }

    addEvents() {
        this.githubForm.addEventListener("submit", (e) => {
            this.onSubmit(e);
        });

        this.themeBtn.addEventListener("click", () => {
            this.toggleTheme();
        });
    }

    loadTheme() {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
            this.themeBtn.innerHTML = "☀️ Light Mode";
        }
    }

    toggleTheme() {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            this.themeBtn.innerHTML = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            this.themeBtn.innerHTML = "🌙 Dark Mode";
        }
    }

    snackBar(message, icon) {
        Swal.fire({
            title: message,
            icon: icon,
            timer: 2000,
            showConfirmButton: false
        });
    }

    showLoader() {
        this.loader.classList.remove("d-none");
        this.card.classList.add("d-none");
    }

    hideLoader() {
        this.loader.classList.add("d-none");
    }

    async makeApiCall(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("GitHub User Not Found");
        }

        return await response.json();
    }

    async onSubmit(event) {
        event.preventDefault();

        const username = this.userControl.value.trim();

        if (username === "") {
            this.snackBar("Please enter a username", "warning");
            return;
        }

        this.showLoader();

        try {
            const profileURL = `${this.BASE_URL}/${username}`;
            const repoURL = `${this.BASE_URL}/${username}/repos?sort=updated&per_page=5`;

            const [user, repos] = await Promise.all([
                this.makeApiCall(profileURL),
                this.makeApiCall(repoURL)
            ]);

            this.renderProfile(user, repos);

            this.card.classList.remove("d-none");
        } catch (error) {
            this.snackBar(error.message, "error");
        } finally {
            this.hideLoader();
            this.githubForm.reset();
        }
    }

    renderProfile(user, repos) {
        let repoHTML = "";

        repos.forEach((repo) => {
            repoHTML += `
                <a
                    href="${repo.html_url}"
                    target="_blank"
                    class="btn btn-outline-primary btn-sm m-1">
                    ${repo.name}
                </a>
            `;
        });

        this.githubContainer.innerHTML = `
            <div class="text-center">

                <img
                    src="${user.avatar_url}"
                    class="rounded-circle shadow border"
                    width="150"
                    height="150">

                <h2 class="mt-3">
                    ${user.name || user.login}
                </h2>

                <p class="text-secondary">
                    @${user.login}
                </p>

                <p>
                    ${user.bio || "No Bio Available"}
                </p>

            </div>

            <hr>

            <div class="row text-center">

                <div class="col">
                    <h5>${user.followers}</h5>
                    <small>Followers</small>
                </div>

                <div class="col">
                    <h5>${user.following}</h5>
                    <small>Following</small>
                </div>

                <div class="col">
                    <h5>${user.public_repos}</h5>
                    <small>Repositories</small>
                </div>

            </div>

            <hr>

            <p><strong>Company :</strong> ${user.company || "Not Available"}</p>

            <p><strong>Location :</strong> ${user.location || "Not Available"}</p>

            <p><strong>Email :</strong> ${user.email || "Private"}</p>

            <p>
                <strong>Website :</strong>

                ${
                    user.blog
                        ? `<a href="${user.blog.startsWith("http") ? user.blog : "https://" + user.blog}" target="_blank">${user.blog}</a>`
                        : "Not Available"
                }

            </p>

            <p>
                <strong>Joined :</strong>
                ${new Date(user.created_at).toDateString()}
            </p>

            <p>
                <strong>Public Gists :</strong>
                ${user.public_gists}
            </p>

            <hr>

            <h4>Latest Repositories</h4>

            <div class="mb-3">
                ${repoHTML}
            </div>

            <div class="d-grid">

                <a
                    href="${user.html_url}"
                    target="_blank"
                    class="btn btn-dark">

                    View GitHub Profile

                </a>

            </div>
        `;
    }
}

new GithubProfileFinder();