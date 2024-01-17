import React from 'react';
import { PureComponent } from 'react';
import { GuessInputProp } from '../types';
import { Formik, Field, Form } from "formik";

class GuesserInputBarViewComp extends PureComponent<GuessInputProp, {}> {
  render() {
    return(
      <Formik initialValues={{"chat-input": ""}}
              onSubmit={this.props.onGuesserSubmit.bind(this)}>
        <Form>
          <Field name="chat-input" type="text"
                 value={this.props.inputText}
                 tabIndex={-1}
                 placeholder="Type here..."
                 onChange={this.props.onGuesserTextChange.bind(this)}
                 disabled={this.props.disabled}/>
          <button type="submit"
                  disabled={this.props.disabled}
                  onClick={() => {}}>
            Submit</button>
        </Form>
      </Formik>
    );
  }
}

const GuesserInputBarView = React.memo(GuesserInputBarViewComp);
export default GuesserInputBarView;