package service

import "fmt"

var DefaultScalingSize int64 = 1

type originAutoScalingPolicy struct {
	minSize         *int64
	maxSize         *int64
	desiredCapacity *int64
}

func (this *originAutoScalingPolicy) toString() string {
	return fmt.Sprintf("MinSize = %d, MaxSize = %d, DesiredCapacity = %d",
		this.getMinSize(), this.getMaxSize(), this.getDesiredCapacity())
}

func (this *originAutoScalingPolicy) getMinSize() *int64 {
	if this.minSize == nil {
		return &DefaultScalingSize
	}
	return this.minSize
}

func (this *originAutoScalingPolicy) getMaxSize() *int64 {
	if this.maxSize == nil {
		return &DefaultScalingSize
	}
	return this.maxSize
}

func (this *originAutoScalingPolicy) getDesiredCapacity() *int64 {
	if this.desiredCapacity == nil {
		return this.getMinSize()
	}
	return this.desiredCapacity
}
