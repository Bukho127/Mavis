# Frontend Development & Contribution Guide

## 1. Purpose

This document defines the frontend development standards, architectural conventions, component patterns, styling rules, and common library usage for the project.

The goal is to keep the codebase:

* Consistent across contributors
* Easy to understand
* Easy to maintain
* Easy to review
* Predictable when adding new features
* Free from unnecessary dependencies and architectural complexity

Before creating a new component, installing a new library, or introducing a new architectural pattern, check this document first.

If a proposed implementation conflicts with these conventions, discuss it with the team before introducing it.

---

# 2. Technology Stack

The frontend is built using the following technologies:

| Technology   | Purpose                              |
| ------------ | ------------------------------------ |
| React        | UI development                       |
| Vite         | Development server and build tooling |
| React Router | Client-side routing                  |
| Tailwind CSS | Styling                              |
| Hugeicons    | Icons                                |
| cmdk         | Command palette/search interfaces    |
| Recharts     | Data visualization and charts        |
| JavaScript   | Application logic                    |
| `api.js`     | Centralized API communication        |

The project intentionally avoids unnecessary global state-management libraries.

---

# 3. Core Architecture Principles

The frontend should follow a simple architecture.

The general flow should be:

```text
Page
 ↓
Feature Components
 ↓
Reusable Components
 ↓
API Layer
 ↓
Backend API
```

For data that comes from the backend:

```text
Component
   ↓
api.js
   ↓
HTTP Request
   ↓
Backend
```

For local UI state:

```text
Component
   ↓
useState
```

For state shared between closely related components:

```text
Parent
 ├── state
 ├── Child A
 └── Child B
```

Do not introduce a global state-management solution simply because multiple components need data.

First determine whether the state actually needs to be global.

---

# 4. State Management

## 4.1 No Redux / Zustand / Context

This project does **not** use:

* Redux
* Redux Toolkit
* Zustand
* MobX
* Recoil
* Jotai
* Global React Context for application state

Do not install one of these libraries for a normal feature without discussing it with the team first.

The default state-management solution is React's built-in:

```jsx
useState()
```

and, where necessary:

```jsx
useReducer()
```

for complex local component state.

---

# 5. When to Use `useState`

Use `useState` when the state belongs to a component or a small component hierarchy.

Examples include:

* Form fields
* Modal visibility
* Dropdown visibility
* Search text
* Selected filters
* Loading states
* Error states
* Pagination
* Tabs
* Selected table rows
* Temporary UI state

Example:

```jsx
const [isOpen, setIsOpen] = useState(false);
```

Another example:

```jsx
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

Keep state as close as possible to where it is used.

---

# 6. Avoiding Prop Drilling

Prop drilling occurs when state is passed through multiple components that do not actually use the state.

For example:

```text
Dashboard
 ↓
Layout
 ↓
Content
 ↓
InterviewList
 ↓
InterviewCard
```

If `Dashboard` owns some state that only `InterviewCard` needs, passing it through every intermediate component is undesirable.

Before introducing a global state-management library, ask:

> Can the state be moved closer to the component that actually uses it?

Often the answer is yes.

For example, instead of:

```jsx
<Dashboard search={search} setSearch={setSearch} />
```

and passing it through several layers, move the search state into the component responsible for the search interface.

---

# 7. State Ownership Rule

Every piece of state should have a clear owner.

Ask:

> Which component is responsible for this piece of state?

For example:

### Search

```jsx
const [search, setSearch] = useState("");
```

should normally live inside the component responsible for the search UI.

### Modal

```jsx
const [isModalOpen, setIsModalOpen] = useState(false);
```

should normally live in the component controlling the modal.

### Form

Form state should live inside the form component.

### Page-specific API data

If a page fetches data that only that page needs, keep the data on that page.

---

# 8. API Communication

All frontend API communication should go through the project's API helper:

```text
api.js
```

Components should not contain repeated raw API configuration.

Avoid scattering code such as:

```jsx
fetch("http://localhost:5000/api/interviews", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});
```

throughout the application.

Instead, centralize API communication.

Example:

```jsx
import api from "../api/api";

const response = await api.get("/interviews");
```

The exact implementation of `api.js` should remain the single source of truth for:

* Base URL
* Authentication headers
* Authorization tokens
* Request configuration
* Common error handling
* HTTP configuration

---

# 9. Authentication Tokens

Authentication tokens should not be manually reconstructed in every component.

The API layer should handle authentication consistently.

For example, if the application stores an authentication token, `api.js` should retrieve and attach it to requests according to the project's existing authentication implementation.

This prevents developers from accidentally creating inconsistent requests.

Bad:

```jsx
fetch("/api/interviews", {
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});
```

repeated across multiple files.

Preferred:

```jsx
const response = await api.get("/interviews");
```

The API helper owns the authentication behaviour.

---

# 10. API Error Handling

API requests should account for:

1. Loading
2. Success
3. Failure

Example:

```jsx
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

const loadData = async () => {
    try {
        setIsLoading(true);
        setError(null);

        const response = await api.get("/interviews");

        setData(response.data);
    } catch (error) {
        setError("Failed to load interviews.");
    } finally {
        setIsLoading(false);
    }
};
```

Do not leave the user with a blank screen when an API request fails.

Provide an appropriate loading, empty, or error state.

---

# 11. Component Structure

Components should generally follow this structure:

```text
Component
├── imports
├── component declaration
├── state
├── derived values
├── event handlers
├── API functions
└── JSX
```

Example:

```jsx
import { useState } from "react";
import { Search } from "hugeicons-react";

function InterviewSearch() {
    const [search, setSearch] = useState("");

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    return (
        <input
            value={search}
            onChange={handleSearch}
            placeholder="Search interviews..."
        />
    );
}

export default InterviewSearch;
```

Keep components readable.

If a component becomes excessively large, split it into smaller components based on responsibility.

---

# 12. Single Responsibility

A component should generally have one clear responsibility.

Avoid creating a component that:

* Fetches several unrelated APIs
* Renders an entire page
* Contains several large forms
* Contains multiple unrelated modals
* Implements complex data transformations
* Handles unrelated UI behaviour

For example, instead of:

```text
Dashboard.jsx
    ├── sidebar
    ├── navbar
    ├── search
    ├── interview table
    ├── statistics
    ├── charts
    ├── modal
    └── form
```

prefer:

```text
Dashboard.jsx
    ├── Sidebar
    ├── Navbar
    ├── InterviewSearch
    ├── InterviewTable
    ├── Statistics
    ├── InterviewChart
    └── InterviewModal
```

The page should compose components rather than implement every detail itself.

---

# 13. Naming Conventions

## Components

Use PascalCase:

```text
InterviewCard.jsx
DashboardHeader.jsx
SearchCommand.jsx
InterviewTable.jsx
```

Avoid:

```text
interviewcard.jsx
dashboard_header.jsx
```

---

## Functions

Use camelCase:

```jsx
handleSubmit()
handleDelete()
fetchInterviews()
handleSearch()
```

---

## Variables

Use descriptive camelCase:

```jsx
const interviewData = [];
const isSubmitting = false;
const selectedInterview = null;
```

Avoid unnecessarily vague names:

```jsx
const x = [];
const thing = {};
const data2 = [];
```

---

## Boolean Variables

Boolean variables should communicate their meaning.

Preferred:

```jsx
isLoading
isOpen
isSubmitting
hasError
isAuthenticated
```

Avoid:

```jsx
loading
open
submit
```

unless the context makes the meaning completely obvious.

---

# 14. Forms

Forms should use controlled inputs.

A typical form should maintain:

```jsx
const [formData, setFormData] = useState({
    email: "",
    password: ""
});

const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

This provides a predictable pattern across forms.

---

# 15. Updating Form State

Use a reusable change handler where appropriate:

```jsx
const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
        ...previous,
        [name]: value
    }));
};
```

Inputs should have matching `name` attributes:

```jsx
<input
    name="email"
    value={formData.email}
    onChange={handleChange}
/>
```

---

# 16. Form Submission

Forms should prevent the browser's default submission behaviour.

Example:

```jsx
const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        setIsSubmitting(true);
        setErrors({});

        await api.post("/auth/login", formData);

    } catch (error) {
        setErrors({
            form: "Unable to sign in."
        });
    } finally {
        setIsSubmitting(false);
    }
};
```

The submit button should communicate its state to the user.

Example:

```jsx
<button disabled={isSubmitting}>
    {isSubmitting ? "Signing in..." : "Sign in"}
</button>
```

---

# 17. Form Validation

Validation should happen before sending invalid data to the backend when practical.

Example:

```jsx
const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
        newErrors.email = "Email is required.";
    }

    if (!formData.password) {
        newErrors.password = "Password is required.";
    }

    return newErrors;
};
```

Keep validation readable rather than creating excessively complicated one-line expressions.

---

# 18. Empty States

Every data-driven component should consider what happens when there is no data.

Do not assume an API will always return records.

For example:

```jsx
if (!interviews.length) {
    return (
        <div>
            <p>No interviews found.</p>
        </div>
    );
}
```

An empty state is different from an error state.

### Empty

> No interviews found.

### Error

> We couldn't load your interviews. Please try again.

### Loading

> Loading interviews...

These states should not be treated as the same thing.

---

# 19. Search With `cmdk`

The project uses the **cmdk** library for command/search interfaces.

Use cmdk when building interfaces such as:

* Command palettes
* Application-wide search
* Keyboard-driven navigation
* Searchable command lists
* Quick actions

Do not build a custom command palette from scratch if the requirement matches cmdk's purpose.

A typical implementation follows the cmdk component model:

```jsx
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem
} from "cmdk";
```

The structure should generally look like:

```jsx
<Command>
    <CommandInput placeholder="Search..." />

    <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Interviews">
            <CommandItem>
                Interview 1
            </CommandItem>

            <CommandItem>
                Interview 2
            </CommandItem>
        </CommandGroup>
    </CommandList>
</Command>
```

The exact import/API should follow the installed cmdk version in the project.

---

# 20. Search Behaviour

Search components should provide useful feedback.

At minimum, consider:

* Search input
* Results
* Empty results
* Loading state when searching remotely
* Keyboard navigation
* Selection behaviour

For local filtering:

```jsx
const filteredInterviews = interviews.filter((interview) =>
    interview.title
        .toLowerCase()
        .includes(search.toLowerCase())
);
```

Do not make the backend request on every keystroke unless that behaviour is intentional.

For server-side search, consider debouncing requests.

---

# 21. Keyboard Accessibility

Command interfaces should remain usable without a mouse.

cmdk provides keyboard-oriented interaction patterns.

Do not remove keyboard navigation simply to implement custom styling.

Important interactions should have visible focus states.

---

# 22. Icons — Hugeicons

The project uses Hugeicons for interface icons.

Use Hugeicons instead of introducing random icon libraries.

Do not mix:

```text
Hugeicons
Lucide
Font Awesome
Heroicons
Material Icons
```

without a specific reason.

Consistency matters more than the tiny differences between icon libraries.

Example:

```jsx
import { Search01Icon } from "hugeicons-react";

<Search01Icon size={20} />
```

Use the appropriate Hugeicons icon for the action being represented.

---

# 23. Icon Usage Guidelines

Icons should communicate meaning.

Good:

```text
Search
Delete
Edit
Settings
Filter
Calendar
Arrow
```

Avoid using icons purely as decoration when they make the interface more confusing.

Interactive icons should have accessible labels when their purpose is not obvious.

Example:

```jsx
<button aria-label="Delete interview">
    <Delete01Icon size={20} />
</button>
```

Do not create icon buttons without an accessible name.

---

# 24. Charts — Recharts

All application charts should use **Recharts**.

Do not introduce another charting library for a normal dashboard visualization.

Examples of appropriate Recharts components include:

```jsx
LineChart
BarChart
AreaChart
PieChart
ResponsiveContainer
XAxis
YAxis
Tooltip
Legend
CartesianGrid
```

A basic chart should use responsive sizing.

Example:

```jsx
<ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" />
    </BarChart>
</ResponsiveContainer>
```

---

# 25. Chart Data

Keep chart data in a predictable format.

Example:

```jsx
const data = [
    {
        name: "January",
        interviews: 12
    },
    {
        name: "February",
        interviews: 18
    },
    {
        name: "March",
        interviews: 24
    }
];
```

Avoid embedding complicated data transformation logic directly inside the chart JSX.

Instead:

```jsx
const chartData = interviews.map((interview) => ({
    name: interview.month,
    interviews: interview.count
}));
```

Then:

```jsx
<BarChart data={chartData}>
```

This keeps the JSX easier to read.

---

# 26. Chart Responsiveness

Charts must work across screen sizes.

Prefer:

```jsx
<ResponsiveContainer width="100%" height={300}>
```

rather than hardcoding a chart width.

Avoid:

```jsx
<BarChart width={1200} height={400}>
```

unless the fixed dimensions are genuinely required.

---

# 27. Chart Accessibility and Readability

Charts should not rely exclusively on colour.

Where appropriate:

* Include labels
* Include legends
* Provide tooltips
* Use meaningful axis names
* Provide a textual summary when the data is important
* Ensure sufficient contrast

Charts are a way of communicating information, not merely decoration.

---

# 28. Styling

Tailwind CSS is the primary styling solution.

Prefer utility classes:

```jsx
<div className="flex items-center gap-4 rounded-lg p-4">
```

over creating a separate CSS file for every component.

---

# 29. Colour Palette

The primary application palette includes:

```text
Dark:
#17211f

Blue:
#0382F7
```

Use the established design palette consistently.

Do not introduce random colours such as:

```text
#ff5733
#9b59b6
#12ff43
```

unless the design specifically requires them.

If a new colour is needed repeatedly, it should be considered for inclusion in the project's design tokens/theme rather than repeatedly hardcoding it.

---

# 30. Tailwind Consistency

Keep class names readable.

Avoid unnecessarily enormous class strings when a component can be simplified.

If the same group of classes is repeated across many places, consider extracting a reusable component rather than copying the same styling everywhere.

For example, instead of repeatedly writing:

```jsx
<button className="rounded-lg bg-[#0382F7] px-4 py-2 text-white ...">
```

create a reusable:

```jsx
<Button>
    Save
</Button>
```

when the pattern appears frequently.

---

# 31. Responsive Design

All new UI should consider:

* Mobile
* Tablet
* Desktop

Use Tailwind responsive utilities:

```text
sm:
md:
lg:
xl:
```

Example:

```jsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
```

Do not design exclusively for the developer's current screen size.

---

# 32. Routing

React Router is responsible for client-side navigation.

Routes should be defined centrally according to the project's existing routing structure.

Use:

```jsx
<Link to="/dashboard">
```

or:

```jsx
navigate("/dashboard");
```

rather than manually modifying `window.location`.

---

# 33. Navigation

For internal application navigation, prefer React Router.

Avoid:

```jsx
window.location.href = "/dashboard";
```

when the route is part of the React application.

Use:

```jsx
navigate("/dashboard");
```

This preserves the SPA navigation model.

---

# 34. Reusable Components

Create reusable components when a UI pattern appears more than once or represents a meaningful application concept.

Examples:

```text
Button
Modal
Input
Card
Badge
Table
Dropdown
LoadingSpinner
EmptyState
ErrorState
```

However, do not prematurely abstract everything.

This is bad:

```text
SuperGenericContainerWithConfigurablePaddingAndMargin.jsx
```

when the component is only used once.

Abstraction should solve repetition or clarify intent.

---

# 35. Pages vs Components

A useful distinction is:

### Pages

Pages represent routes.

Examples:

```text
Login
Register
Dashboard
Interviews
Profile
Settings
```

### Components

Components represent reusable UI or a specific feature.

Examples:

```text
InterviewCard
InterviewTable
SearchCommand
StatisticsCard
ProfileForm
Sidebar
Navbar
```

A page should primarily compose components.

---

# 36. Folder Structure

Use a structure that makes feature ownership obvious.

A recommended structure is:

```text
src/
├── assets/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   └── Interviews/
│
├── hooks/
│
├── api/
│   └── api.js
│
├── utils/
│
├── routes/
│
├── App.jsx
└── main.jsx
```

The exact structure can be adapted to the existing repository, but new code should follow the established project structure rather than creating competing conventions.

---

# 37. Hooks

Custom hooks should be created when behaviour is reused.

For example:

```jsx
useDebounce()
useAuth()
useInterviews()
```

Do not create a custom hook simply to wrap one line of `useState`.

A hook should represent reusable behaviour rather than merely moving code into another file.

---

# 38. API Logic vs UI Logic

Separate API communication from UI presentation.

Avoid putting large API implementations directly into JSX.

Bad:

```jsx
function Dashboard() {
    const fetchEverything = async () => {
        // hundreds of lines of API logic
    };

    return (...);
}
```

Prefer:

```jsx
const loadInterviews = async () => {
    const response = await api.get("/interviews");
    return response.data;
};
```

Then the component controls how the data is displayed.

---

# 39. Do Not Duplicate Backend Logic

The frontend should not attempt to recreate complex backend business logic unless there is a clear UI requirement.

For example, if the backend determines:

```text
interview status
eligibility
permissions
application state
```

the frontend should consume those results rather than independently implementing a second version of the business rules.

This prevents the frontend and backend from disagreeing.

---

# 40. Loading States

Every asynchronous operation should provide appropriate feedback.

Examples:

```jsx
{isLoading ? (
    <LoadingSpinner />
) : (
    <InterviewTable data={interviews} />
)}
```

Buttons should also indicate submission state:

```jsx
<button disabled={isSubmitting}>
    {isSubmitting ? "Saving..." : "Save"}
</button>
```

Avoid allowing users to repeatedly submit the same request while it is processing.

---

# 41. Error States

Errors should be handled intentionally.

Avoid:

```jsx
catch (error) {
    console.log(error);
}
```

as the only error handling.

The user should receive useful feedback.

Example:

```jsx
{error && (
    <div>
        <p>{error}</p>
        <button onClick={loadInterviews}>
            Try again
        </button>
    </div>
)}
```

---

# 42. Console Logging

Do not leave unnecessary debugging logs in production code.

Avoid:

```jsx
console.log("HERE");
console.log(data);
console.log("WHY IS THIS BROKEN");
```

Temporary debugging logs should be removed before submitting a pull request.

If logging is genuinely required, it should provide meaningful information.

---

# 43. Security

Never expose sensitive information in frontend code.

Do not commit:

```text
API keys
Passwords
Private tokens
Secrets
Production credentials
```

Environment variables should be used for configuration where appropriate.

Remember that frontend environment variables are generally visible to users after the application is built. They should **not** be treated as a secure place for secrets.

---

# 44. Environment Variables

Environment-specific configuration should be stored using the project's environment configuration.

For Vite applications, frontend-exposed variables generally use:

```text
VITE_
```

Example:

```text
VITE_API_URL=
```

Do not hardcode environment-specific URLs throughout components.

---

# 45. Git Workflow

Use meaningful commit messages.

Good:

```text
feat: add interview search
fix: resolve authentication token issue
refactor: extract interview card
style: improve dashboard spacing
docs: update frontend conventions
```

Avoid:

```text
stuff
changes
final
final2
please work
asdf
```

---

# 46. Branches

Features and fixes should generally be developed in separate branches.

Example:

```text
main
│
├── feature/interview-search
├── feature/dashboard-chart
├── fix/auth-token
└── refactor/interview-card
```

Do not directly push experimental work to `main` unless the team's workflow explicitly permits it.

---

# 47. Pull Requests

Before opening a pull request, check:

* Does the application build?
* Does the feature work?
* Are loading states handled?
* Are error states handled?
* Are empty states handled?
* Is the UI responsive?
* Are unnecessary console logs removed?
* Are unused imports removed?
* Does the implementation follow the existing conventions?
* Did you introduce an unnecessary dependency?
* Did you duplicate existing components?
* Did you introduce a new styling pattern?

---

# 48. Dependency Policy

Do not install a package simply because it makes one small task easier.

For example:

> We already use Recharts.

Do not install another chart library because one chart looks slightly easier to implement with it.

Likewise:

> We already use Hugeicons.

Do not install another icon library for one icon.

---

# 49. Component Decision Process

Before creating a new component, ask:

### 1. Is it reused?

If yes, create a reusable component.

### 2. Is it conceptually meaningful?

If yes, a component may improve readability even if it is currently used once.

### 3. Is it only a few lines?

If yes, keeping it inside the parent may be better.

### 4. Is the parent becoming too large?

If yes, split it.

---

# 50. Data Flow

The preferred data flow is predictable and explicit.

```text
API
 ↓
Page
 ↓
Component
 ↓
Child Component
```

For example:

```jsx
function InterviewsPage() {
    const [interviews, setInterviews] = useState([]);

    return (
        <InterviewTable interviews={interviews} />
    );
}
```

Then:

```jsx
function InterviewTable({ interviews }) {
    return (
        ...
    );
}
```

This makes the data relationship explicit.

---

# 51. When Props Are Appropriate

Props are not bad.

Props are the standard React mechanism for communicating between components.

Use props when:

* A parent owns the state
* A child needs to display that state
* A child needs to trigger a parent action
* Components have a clear parent-child relationship

Example:

```jsx
<InterviewCard
    interview={interview}
    onDelete={handleDelete}
/>
```

This is preferred over introducing global state for a simple parent-child relationship.

---

# 52. Avoid Excessive Prop Chains

Props become problematic when they travel through many unrelated components.

For example:

```text
Dashboard
 → Layout
 → Content
 → Section
 → Wrapper
 → Card
 → Button
```

If every component only passes the prop to the next component without using it, reconsider the component hierarchy.

Possible solutions include:

* Moving state closer to the consumer
* Moving the component closer to the state owner
* Splitting the feature differently
* Passing a more focused object/function
* Rethinking the component boundaries

Do **not** immediately solve this with Redux.

---

# 53. Server Data vs UI State

It is important to distinguish between two kinds of state.

### UI state

Examples:

```text
isModalOpen
searchText
selectedTab
isDropdownOpen
formData
```

Use:

```jsx
useState
```

### Server data

Examples:

```text
interviews
user profile
dashboard statistics
applications
```

For the current project, keep the implementation simple and use the existing API layer plus component state unless the application requirements change.

If server-data complexity becomes significant, the team can revisit a dedicated data-fetching solution later.

Do not introduce it preemptively.

---

# 54. Performance

Do not optimize prematurely.

First write clear code.

Only introduce techniques such as:

```jsx
useMemo()
useCallback()
React.memo()
```

when there is a demonstrated performance reason or a clear expensive computation/reference-stability requirement.

Do not use:

```jsx
useMemo()
```

for every variable.

Readable code is more important than theoretical micro-optimizations.

---

# 55. Accessibility

Every feature should consider accessibility.

Important requirements include:

* Buttons should be actual `<button>` elements.
* alt text must be described and be well explained for accessibility purposes
* Links should use `<a>` or React Router `<Link>`.
* Inputs should have labels.
* Icon-only buttons should have accessible names.
* Interactive elements should be keyboard accessible.
* Focus states should remain visible.
* Images should have appropriate `alt` text.
* Colour should not be the only method of communicating information.

Avoid clickable `<div>` elements when a semantic HTML element exists.

Bad:

```jsx
<div onClick={handleClick}>
    Delete
</div>
```

Preferred:

```jsx
<button onClick={handleClick}>
    Delete
</button>
```

---

# 56. General React Rules

Prefer functional components:
the project is alrady using error functions, the codebase should be consistent and cohesive.

```jsx
function Dashboard() {
    return (...);
}
```

Use hooks for component behaviour.

Avoid unnecessary direct DOM manipulation.

Avoid:

```jsx
document.querySelector(...)
```

when React state, refs, or event handlers can solve the problem.

React should remain responsible for the UI.

---

# 57. JSX Readability

Avoid excessively complicated JSX.

Bad:

```jsx
return condition ? loading ? <A /> : error ? <B /> : data ? <C /> : <D /> : <E />;
```

Prefer:

```jsx
if (isLoading) {
    return <LoadingState />;
}

if (error) {
    return <ErrorState />;
}

if (!data.length) {
    return <EmptyState />;
}

return <InterviewTable data={data} />;
```

Readable code is easier to debug and review.

---

# 58. Comments

Comments should explain **why**, not simply repeat **what** the code does.

Bad:

```jsx
// Set loading to true
setIsLoading(true);
```

Useful:

```jsx
// Prevent duplicate submissions while the authentication request is pending.
setIsSubmitting(true);
```

Do not comment obvious code.

---

# 59. Before Building a New Feature

Before starting development:

### Step 1 — Understand the existing implementation

Look for:

* Existing components
* Existing API functions
* Existing Tailwind patterns
* Existing icons
* Existing form patterns
* Existing chart components

### Step 2 — Reuse before creating

Ask:

> Does this already exist?

If yes, reuse it.

### Step 3 — Follow existing conventions

Do not create a second way of doing the same thing.
follow DRY principle.

### Step 4 — Keep state local

Start with `useState`.

Only reconsider the architecture if the feature genuinely requires something more complex.

---

# 60. Example Feature Implementation

Suppose we need to add an interview dashboard.

A reasonable structure could be:

```text
pages/
└── Dashboard/
    ├── Dashboard.jsx
    ├── DashboardStats.jsx
    ├── InterviewChart.jsx
    ├── InterviewList.jsx
    └── InterviewSearch.jsx
```

The page owns the page-level data:

```jsx
function Dashboard() {
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data...

    return (
        <div>
            <DashboardStats interviews={interviews} />

            <InterviewSearch />

            <InterviewChart interviews={interviews} />

            <InterviewList interviews={interviews} />
        </div>
    );
}
```

The child components receive only the data they need.

---

# 61. Example: Search + List

```jsx
function InterviewList({ interviews }) {
    const [search, setSearch] = useState("");

    const filteredInterviews = interviews.filter((interview) =>
        interview.title
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div>
            <SearchCommand
                value={search}
                onValueChange={setSearch}
            />

            {filteredInterviews.length === 0 ? (
                <p>No interviews found.</p>
            ) : (
                filteredInterviews.map((interview) => (
                    <InterviewCard
                        key={interview.id}
                        interview={interview}
                    />
                ))
            )}
        </div>
    );
}
```

Notice that the search state lives close to the search functionality.

There is no reason for Redux to exist simply to store:

```jsx
search
```

---

# 62. Example: Dashboard Chart

```jsx
function InterviewChart({ interviews }) {
    const chartData = interviews.map((interview) => ({
        name: interview.month,
        interviews: interview.count
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interviews" />
            </BarChart>
        </ResponsiveContainer>
    );
}
```

The chart is responsible for visualizing the data.

The API request should not be implemented inside the chart unless the chart itself is explicitly responsible for fetching its own independent data.

---

# 63. What We Do Not Want

Avoid these patterns unless there is a strong architectural reason.

### Global Redux store for every piece of state

```text
Redux
 ├── search
 ├── modal
 ├── form
 ├── selectedTab
 └── dropdown
```

Not necessary.

---

### Multiple icon libraries

```text
Hugeicons
+
Font Awesome
+
Lucide
```

Avoid.

---

### Multiple chart libraries

```text
Recharts
+
Chart.js
+
ApexCharts
```

Avoid.

---

### Raw API requests everywhere

```text
Dashboard.jsx → fetch()
Profile.jsx → axios()
Interview.jsx → fetch()
Admin.jsx → fetch()
```

Avoid inconsistent API access patterns.

Use the established API layer.

---

### Giant components

Avoid files containing hundreds of lines of unrelated UI and logic.

Break them into meaningful components.

---

# 64. Quick Reference

## State

```jsx
useState()
```

Default choice.

**No Redux, Zustand, or global Context.**

---

## API

```jsx
api.js
```

Central API communication layer.

---

## Styling

```text
Tailwind CSS
```

---

## Icons

```text
Hugeicons
```

---

## Charts

```text
Recharts
```

---

## Search / Command Menu

```text
cmdk
```

---

## Routing

```text
React Router
```

---

## Build Tool

```text
Vite
```

---

# 65. Decision Checklist

Before adding something new, ask:

```text
Does the project already have a solution?
        │
        ├── YES → Reuse it
        │
        └── NO
             │
             ↓
Can React/Tailwind solve it?
             │
        ├── YES → Use the existing stack
        │
        └── NO
             │
             ↓
Is a new dependency genuinely justified?
             │
        ├── NO → Don't add it
        │
        └── YES → Discuss before adding
```

For state specifically:

```text
Does only one component need it?
        │
        └── useState

Does a parent and its children need it?
        │
        └── Parent state + props

Are unrelated parts of the application
sharing complex, frequently-changing state?
        │
        └── Discuss architecture before
            introducing state management
```

---

# 66. Definition of Done

A frontend feature is considered ready when:

* [ ] The feature works as intended.
* [ ] Existing components were reused where appropriate.
* [ ] API calls use `api.js`.
* [ ] Authentication is handled through the established API mechanism.
* [ ] State is kept local unless there is a clear reason otherwise.
* [ ] No unnecessary state-management library was introduced.
* [ ] Tailwind is used consistently.
* [ ] Existing colours/design conventions are followed.
* [ ] Hugeicons are used for icons.
* [ ] Recharts is used for charts.
* [ ] cmdk is used for command/search interfaces where appropriate.
* [ ] Loading states exist for asynchronous operations.
* [ ] Error states exist for failed requests.
* [ ] Empty states exist for data-driven views.
* [ ] Forms use controlled inputs.
* [ ] Buttons communicate submitting/loading states.
* [ ] The interface is responsive.
* [ ] Interactive elements are keyboard accessible.
* [ ] Unnecessary console logs have been removed.
* [ ] Unused imports and variables have been removed.
* [ ] The application builds successfully.
* [ ] The implementation follows the project's existing conventions.

---

# 67. Final Principle

The frontend should favour **simplicity, consistency, and explicit data flow** over unnecessary abstraction.

The default approach is:

```text
React
+
useState
+
Props
+
api.js
+
Tailwind
+
Hugeicons
+
cmdk
+
Recharts
+
React Router
```

Do not add complexity until the application actually requires it.

A simple implementation that the entire team understands is preferable to a sophisticated architecture that solves problems the application does not currently have.

When a problem appears repeatedly, then we should evaluate whether the architecture needs to change.

**AI contributions are allowed but do not let it make decisions on your behalf- read on things you do not understand. always review the AI output**
