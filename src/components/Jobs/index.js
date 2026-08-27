import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {Link} from 'react-router-dom'

import Header from '../Header'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const locationsList = [
  {
    label: 'Hyderabad',
    locationId: 'Hyderabad',
  },
  {
    label: 'Bangalore',
    locationId: 'Bangalore',
  },
  {
    label: 'Chennai',
    locationId: 'Chennai',
  },
  {
    label: 'Delhi',
    locationId: 'Delhi',
  },
  {
    label: 'Mumbai',
    locationId: 'Mumbai',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    profileData: {},
    apiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeSalaryRange: '',
    activeEmploymentTypes: [],
    activeLocations: [],
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  getProfile = async () => {
    const jwtToken = Cookies.get('jwt_token')

    const profileApiUrl = 'https://apis.ccbp.in/profile'

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(profileApiUrl, options)

    if (response.ok === true) {
      const data = await response.json()

      this.setState({
        profileData: data.profile_details,
      })
    }
  }

  getJobs = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })

    const {
      searchInput,
      activeSalaryRange,
      activeEmploymentTypes,
      activeLocations,
    } = this.state

    const employmentType = activeEmploymentTypes.join(',')
    const location = activeLocations.join(',')

    const jwtToken = Cookies.get('jwt_token')

    const jobsApiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentType}&minimum_package=${activeSalaryRange}&search=${searchInput}&location=${location}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(jobsApiUrl, options)

    if (response.ok === true) {
      const data = await response.json()

      this.setState({
        jobsList: data.jobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  changeSearchInput = event => {
    this.setState({
      searchInput: event.target.value,
    })
  }

  onClickSearch = () => {
    this.getJobs()
  }

  onChangeEmploymentType = event => {
    const {activeEmploymentTypes} = this.state

    if (event.target.checked) {
      this.setState(
        {
          activeEmploymentTypes: [...activeEmploymentTypes, event.target.id],
        },
        this.getJobs,
      )
    } else {
      this.setState(
        {
          activeEmploymentTypes: activeEmploymentTypes.filter(
            eachType => eachType !== event.target.id,
          ),
        },
        this.getJobs,
      )
    }
  }

  onChangeSalaryRange = event => {
    this.setState(
      {
        activeSalaryRange: event.target.id,
      },
      this.getJobs,
    )
  }

  onChangeLocation = event => {
    const {activeLocations} = this.state

    if (event.target.checked) {
      this.setState(
        {
          activeLocations: [...activeLocations, event.target.id],
        },
        this.getJobs,
      )
    } else {
      this.setState(
        {
          activeLocations: activeLocations.filter(
            eachLocation => eachLocation !== event.target.id,
          ),
        },
        this.getJobs,
      )
    }
  }

  renderLoader = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />

      <h1>Oops! Something Went Wrong</h1>

      <p>We cannot seem to find the page you are looking for</p>

      <button type="button" onClick={this.getJobs}>
        Retry
      </button>
    </div>
  )

  renderNoJobsView = () => (
    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        alt="no jobs"
      />

      <h1>No Jobs Found</h1>

      <p>We could not find any jobs. Try other filters.</p>
    </div>
  )

  renderJobsList = () => {
    const {jobsList} = this.state

    if (jobsList.length === 0) {
      return this.renderNoJobsView()
    }

    return (
      <ul>
        {jobsList.map(eachJob => (
          <li key={eachJob.id}>
            <Link to={`/jobs/${eachJob.id}`}>
              <img src={eachJob.company_logo_url} alt="company logo" />

              <h1>{eachJob.title}</h1>

              <p>{eachJob.rating}</p>

              <p>{eachJob.location}</p>

              <p>{eachJob.employment_type}</p>

              <p>{eachJob.package_per_annum}</p>

              <h1>Description</h1>

              <p>{eachJob.job_description}</p>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  renderAllJobs = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobsList()

      case apiStatusConstants.failure:
        return this.renderFailureView()

      case apiStatusConstants.inProgress:
        return this.renderLoader()

      default:
        return null
    }
  }

  renderProfile = () => {
    const {profileData} = this.state

    return (
      <div>
        <img src={profileData.profile_image_url} alt="profile" />

        <h1>{profileData.name}</h1>

        <p>{profileData.short_bio}</p>
      </div>
    )
  }

  render() {
    const {
      searchInput,
      activeSalaryRange,
      activeEmploymentTypes,
      activeLocations,
    } = this.state

    return (
      <>
        <Header />

        <div className="jobs-page">
          <div className="jobs-sidebar">
            {this.renderProfile()}

            <input
              type="search"
              placeholder="Search"
              value={searchInput}
              onChange={this.changeSearchInput}
            />

            <button
              type="button"
              data-testid="searchButton"
              onClick={this.onClickSearch}
            >
              Search
            </button>

            <h1>Type of Employment</h1>

            <ul>
              {employmentTypesList.map(eachItem => (
                <li key={eachItem.employmentTypeId}>
                  <input
                    type="checkbox"
                    id={eachItem.employmentTypeId}
                    checked={activeEmploymentTypes.includes(
                      eachItem.employmentTypeId,
                    )}
                    onChange={this.onChangeEmploymentType}
                  />

                  <label htmlFor={eachItem.employmentTypeId}>
                    {eachItem.label}
                  </label>
                </li>
              ))}
            </ul>

            <h1>Salary Range</h1>

            <ul>
              {salaryRangesList.map(eachItem => (
                <li key={eachItem.salaryRangeId}>
                  <input
                    type="radio"
                    id={eachItem.salaryRangeId}
                    name="salary"
                    checked={activeSalaryRange === eachItem.salaryRangeId}
                    onChange={this.onChangeSalaryRange}
                  />

                  <label htmlFor={eachItem.salaryRangeId}>
                    {eachItem.label}
                  </label>
                </li>
              ))}
            </ul>

            <h1>Location</h1>

            <ul>
              {locationsList.map(eachItem => (
                <li key={eachItem.locationId}>
                  <input
                    type="checkbox"
                    id={eachItem.locationId}
                    checked={activeLocations.includes(eachItem.locationId)}
                    onChange={this.onChangeLocation}
                  />

                  <label htmlFor={eachItem.locationId}>{eachItem.label}</label>
                </li>
              ))}
            </ul>
          </div>

          <div className="jobs-list-container">{this.renderAllJobs()}</div>
        </div>
      </>
    )
  }
}

export default Jobs
