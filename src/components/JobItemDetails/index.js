import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'

import Header from '../Header'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    jobDetails: {},
    similarJobs: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })

    const jwtToken = Cookies.get('jwt_token')

    const {match} = this.props
    const {params} = match
    const {id} = params

    const apiUrl = `https://apis.ccbp.in/jobs/${id}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)

    if (response.ok === true) {
      const data = await response.json()

      this.setState({
        jobDetails: data.job_details,
        similarJobs: data.similar_jobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
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

      <p>We cannot seem to find the page you are looking for.</p>

      <button type="button" onClick={this.getJobDetails}>
        Retry
      </button>
    </div>
  )

  renderJobDetails = () => {
    const {jobDetails, similarJobs} = this.state

    return (
      <div>
        <img src={jobDetails.company_logo_url} alt="job details company logo" />

        <h1>{jobDetails.title}</h1>

        <p>{jobDetails.rating}</p>

        <p>{jobDetails.location}</p>

        <p>{jobDetails.employment_type}</p>

        <p>{jobDetails.package_per_annum}</p>

        <h1>Description</h1>

        <a href={jobDetails.company_website_url}>Visit</a>

        <p>{jobDetails.job_description}</p>

        <h1>Skills</h1>

        <ul>
          {jobDetails.skills?.map(eachSkill => (
            <li key={eachSkill.name}>
              <img src={eachSkill.image_url} alt={eachSkill.name} />

              <p>{eachSkill.name}</p>
            </li>
          ))}
        </ul>

        <h1>Life at Company</h1>

        <p>{jobDetails.life_at_company?.description}</p>

        <img
          src={jobDetails.life_at_company?.image_url}
          alt="life at company"
        />

        <h1>Similar Jobs</h1>

        <ul>
          {similarJobs.map(eachJob => (
            <li key={eachJob.id}>
              <img
                src={eachJob.company_logo_url}
                alt="similar job company logo"
              />

              <h1>{eachJob.title}</h1>

              <p>{eachJob.rating}</p>

              <p>{eachJob.location}</p>

              <p>{eachJob.employment_type}</p>

              <h1>Description</h1>

              <p>{eachJob.job_description}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderAllDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobDetails()

      case apiStatusConstants.failure:
        return this.renderFailureView()

      case apiStatusConstants.inProgress:
        return this.renderLoader()

      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />

        {this.renderAllDetails()}
      </>
    )
  }
}

export default JobItemDetails
